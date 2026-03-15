class OnlyDropdown extends HTMLElement {

    static formAssociated = true;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._internals = this.attachInternals();
        this._items = [];
        this._filteredItems = [];
        
        this._selectedValue = null;
        this._internals.setFormValue(this._selectedValue);

        // keeps a value until element is loaded
        this._pendingValue = null;

        this._highlightedIndex = -1;
        this._isOpen = false;
        
        // default properties
        this.mode = this.getAttribute('mode') || 'pick'; // 'pick' or 'type'
        this.filterable = this.hasAttribute('filterable');
        this.clearable = this.hasAttribute('clearable');
        this.placeholder = this.getAttribute('placeholder') ?? 'Select ...'; 
        this.filterPlaceholder = this.getAttribute('filterPlaceholder') ?? 'Filter ...'; 

        // custom css
        this.css = {};
        this.css.dropdownWindow = this.getAttribute('dropdownWindowCss') ?? ''; 
        this.css.item = this.getAttribute('itemCss') ?? ''; 
        this.css.itemSelected = this.getAttribute('selectedItemCss') ?? ''; 
        this.css.filterInput = this.getAttribute('filterInputCss') ?? ''; 
        this.css.filterWrapper = this.getAttribute('filterWrapperCss') ?? ''; 
        this.css.dropdownWindow = this.getAttribute('dropdownWindowCss') ?? ''; 
        this.css.input = this.getAttribute('inputCss') ?? ''; 

        this.render();
        this.cacheElements();
        this.bindEvents();
    }

    static get observedAttributes() {
        return ['value'];
    }

    connectedCallback() {
        const itemsAttr = this.getAttribute('data-items');
        if (itemsAttr) {
            try {
                this.items = JSON.parse(itemsAttr);
            } catch (e) {
                console.error("Invalid JSON in data-items attribute");
            }
        }
    }

    // property setters getters
    set items(value) {
        this._items = Array.isArray(value) ? value : [];
        this.updateList();

        if (this._pendingValue) {
            this.value = this._pendingValue;
            this._pendingValue = null;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value' && oldValue !== newValue) {
            this.value = newValue;
        }
    }

    get items() {
        return this._items;
    }

    set value(val) {

        if (!this.items.length) {
            this._pendingValue = val;
            return;
        }

        if (!val){
            this.selectItem({value: null, display: null});
            return;
        }

        let strVal = JSON.stringify(val);
        let itemFound = this.items.find(i => i.value == val || i == val || JSON.stringify(i) == strVal);

        if (this.mode === 'pick' && itemFound){
            this.selectItem(itemFound);
        }

        if (this.mode === 'type') {
            if (itemFound)
                this.selectItem(itemFound);
            else
                this.selectItem({value: val, display: val});
        }
    }

    get value() {
        return this._selectedValue;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    position: relative;
                    font-family: sans-serif;
                    box-sizing: border-box;
                    width: 250px; /* Default width */
                    background: #fff;
                    border-radius: 4px;
                    outline: 1px solid #ccc;
                }
                * { box-sizing: border-box; }
                .trigger-wrapper {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    overflow: hidden;
                }
                .main-input {
                    flex-grow: 1;
                    border: none;
                    outline: none;
                    padding: 10px;
                    background: transparent;
                    cursor: inherit;
                    ${this.css.input}
                }
                .button {
                    padding: 0 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .button svg {
                    width: 16px;
                    height: 16px;
                    fill: #666;
                }
                .chevron svg {
                    width: 16px;
                    height: 16px;
                    fill: #666;
                    transition: transform 0.2s ease;
                }
                :host([open]) .chevron svg {
                    transform: rotate(180deg);
                }
                .dropdown-window {
                    display: none;
                    position: fixed;
                    background: #fff;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.8);
                    z-index: 9999;
                    flex-direction: column;
                    ${this.css.dropdownWindow}
                }
                .dropdown-window.show {
                    display: flex;
                }
                .filter-wrapper {
                    padding: 8px;
                    border-bottom: 1px solid #eee;
                    ${this.css.filterWrapper}
                }
                .filter-input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    outline: none;
                    ${this.css.filterInput}
                }
                .item-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    overflow-y: auto;
                    flex-grow: 1;
                }
                .item {
                    padding: 10px;
                    cursor: pointer;
                    user-select: none;
                    ${this.css.item}
                }
                .item:hover, .item.highlighted {
                    background: #f0f0f0;
                }
                .item.selected {
                    font-weight: bold;
                    color: #0056b3;
                    ${this.css.itemSelected}
                }
            </style>

            <div class="trigger-wrapper" part="trigger">
                <input type="text" class="main-input" part="main-input" placeholder="${this.placeholder}">
                <div class="button clear" part="clear"  style="display: none;">
                    <svg viewBox="0 0 24 24">
                        <path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 1 0-1.4 1.4L10.6 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4z"/>
                    </svg>
                </div>
                <div class="button chevron" part="chevron">
                    <svg viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z"/>
                    </svg>
                </div>
            </div>

            <div class="dropdown-window" part="dropdown">
                <div class="filter-wrapper" style="display: none;">
                    <input type="text" class="filter-input" part="filter-input" placeholder="${this.filterPlaceholder}">
                </div>
                <ul class="item-list" part="list"></ul>
            </div>
        `;
    }

    cacheElements() {
        this.triggerWrapper = this.shadowRoot.querySelector('.trigger-wrapper');
        this.mainInput = this.shadowRoot.querySelector('.main-input');
        this.dropdownWindow = this.shadowRoot.querySelector('.dropdown-window');
        this.filterWrapper = this.shadowRoot.querySelector('.filter-wrapper');
        this.filterInput = this.shadowRoot.querySelector('.filter-input');
        this.itemList = this.shadowRoot.querySelector('.item-list');
        this.buttonClear = this.shadowRoot.querySelector('.clear');

        if (this.mode === 'pick') {
            this.mainInput.readOnly = true;
            this.mainInput.style.cursor = 'pointer';
        }
        if (this.filterable) {
            this.filterWrapper.style.display = 'block';
        }

        if (this.clearable)
            this.buttonClear.style.display = '';
    }

    bindEvents() {
        // toggle dropdown
        this.triggerWrapper.addEventListener('click', (e) => {
            if (this.mode === 'type' && e.target === this.mainInput) {
                this.openDropdown();
            } else {
                this.toggleDropdown();
            }
        });

        // clear
        this.buttonClear.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            this._selectedValue = null;
            this._internals.setFormValue(this._selectedValue);

            this.mainInput.value = '';
            this.dispatchEvent(new CustomEvent('clear'));
            this.selectItem({value: null, display: null})
        });

        // close on outside click
        document.addEventListener('mousedown', (e) => {
            if (!this.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // filter
        if (this.filterable) {
            this.filterInput.addEventListener('input', (e) => this.handleFilter(e.target.value));
        }

        // exit
        if (this.mode === 'type') {
            this.mainInput.addEventListener('blur', (e) => this.handleBlur());
        }

        // keyboard navigation
        this.addEventListener('keydown', (e) => this.handleKeydown(e, {arrowKeys: false}));
        this.filterInput.addEventListener('keydown', (e) => this.handleKeydown(e, {arrowKeys: false}));
        this.mainInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this._isOpen && this.mode === 'type') {
                this.openDropdown();
            } else {
                this.handleKeydown(e, {arrowKeys: true});
            }
        });
    }

    updateList(filterText = '') {
        this._filteredItems = this._items.filter(item => 
            item.display.toLowerCase().includes(filterText.toLowerCase())
        );
        this.renderItems();
    }

    handleFilter(text) {
        this.openDropdown();
        this.updateList(text);
    }

    handleBlur(text) {

        // if there is a manually changed value in an input then this is the new value
        if (this.mode === 'type' && ! this._isOpen) {
            if (this._selectedValue != this.mainInput.value)
                this.selectItem({value: this.mainInput.value, display: this.mainInput.value})
        }
    }

    renderItems() {
        this.itemList.innerHTML = '';

        this._filteredItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.classList.add('item');
            if (item.value === this._selectedValue) li.classList.add('selected');
            if (index === this._highlightedIndex) li.classList.add('highlighted');
            
            li.textContent = item.display;
            li.part = 'item';
            
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectItem(item);
            });
            this.itemList.appendChild(li);
        });
    }

    selectItem(item) {
        this._selectedValue = item.value;

        if (item.value !== null)
            this.setAttribute('value', item.value);
        else
            this.removeAttribute('value');

        this._internals.setFormValue(this._selectedValue);

        this.mainInput.value = item.display;
        this.dispatchEvent(new CustomEvent('change', { 
            detail: { value: item.value, display: item.display } 
        }));
        this.closeDropdown();
    }

    toggleDropdown() {
        this._isOpen ? this.closeDropdown() : this.openDropdown();
    }

    openDropdown() {
        if (this._isOpen) return;
        this._isOpen = true;
        this.setAttribute('open', '');
        
        if (this.filterable) {
            this.filterInput.value = '';
        } 
        if (this.mode === 'type') {
             this.updateList();
        }
        
        if (this.mode === 'pick') this.updateList('');

        const triggerRect = this.triggerWrapper.getBoundingClientRect();
        this.dropdownWindow.style.width = `${triggerRect.width}px`;

        this.dropdownWindow.classList.add('show');
        this.positionDropdown();
    }

    closeDropdown() {
        this._isOpen = false;
        this.removeAttribute('open');
        this.dropdownWindow.classList.remove('show');
        this._highlightedIndex = -1;
    }

    positionDropdown() {
        const triggerRect = this.triggerWrapper.getBoundingClientRect();
        const dropdownHeight = this.dropdownWindow.offsetHeight || 200; 
        const windowHeight = window.innerHeight;

        const rect = this.calculateDropdownRect(triggerRect, dropdownHeight, windowHeight);

        this.dropdownWindow.style.top = `${rect.top}px`;
        this.dropdownWindow.style.left = `${rect.left}px`;
        this.dropdownWindow.style.width = `${rect.width}px`;
        this.dropdownWindow.style.maxHeight = `${rect.maxHeight}px`;
        if (rect.position == "above"){
            // fix dropdown window height if it's above
            this.dropdownWindow.style.height = `${dropdownHeight}px`;
        }
    }

    handleKeydown(e, extras) {
        if (!this._isOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.openDropdown();
            }
            return;
        }

        const itemsCount = this._filteredItems.length;

        switch (e.key) {
            case 'ArrowDown':
                if (! extras.arrowKeys)
                    break;

                e.preventDefault();
                this._highlightedIndex = (this._highlightedIndex + 1) % itemsCount;
                this.renderItems();
                this.scrollToHighlighted();
                break;
            case 'ArrowUp':
                if (! extras.arrowKeys)
                    break;

                e.preventDefault();
                this._highlightedIndex = (this._highlightedIndex - 1 + itemsCount) % itemsCount;
                this.renderItems();
                this.scrollToHighlighted();
                break;
            case 'Enter':
                e.preventDefault();
                if (this._highlightedIndex >= 0 && this._highlightedIndex < itemsCount) {
                    this.selectItem(this._filteredItems[this._highlightedIndex]);
                }
                break;
            case 'Escape':
                this.closeDropdown();
                break;
        }
    }

    scrollToHighlighted() {
        const highlightedEl = this.itemList.children[this._highlightedIndex];
        if (highlightedEl) {
            highlightedEl.scrollIntoView({ block: 'nearest' });
        }
    }

    calculateDropdownRect(triggerRect, dropdownHeight, windowHeight) {
        const spaceBelow = windowHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        const spaceThreshold = windowHeight * (1/3);
        let top;
        let maxHeight;
        let position;

        if (spaceBelow >= spaceThreshold) {
            top = triggerRect.bottom;
            maxHeight = spaceBelow;
            position = 'below';
        } 
        else if (spaceAbove >= spaceThreshold) {
            top = triggerRect.top - dropdownHeight;
            maxHeight = spaceAbove;
            position = 'above';
        } 
        else {
            if (spaceBelow > spaceAbove) {
                top = triggerRect.bottom;
                maxHeight = spaceBelow;
                position = 'below';
            } else {
                top = 0; 
                maxHeight = spaceAbove;
                position = 'above';
            }
        }

        return {
            top: top,
            left: triggerRect.left,
            width: triggerRect.width,
            maxHeight: maxHeight,
            position: position
        };
    }
}

customElements.define('only-dropdown', OnlyDropdown);