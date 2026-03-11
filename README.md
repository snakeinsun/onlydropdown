# OnlyDropdown

`<only-dropdown>` is a lightweight **Web Component dropdown/select** with optional filtering, typing mode, and native **HTML form integration**.

It is framework-agnostic and works in any environment that supports **Custom Elements** and **Shadow DOM**.

## Features

- Native **form-associated custom element**
- Two modes:
  - **pick** – select from predefined items
  - **type** – type custom values
- Optional **filtering**
- Optional **clear button**
- Keyboard navigation
- Automatic dropdown positioning (above/below depending on viewport space)
- Fully encapsulated with **Shadow DOM**
- Customizable via attributes and CSS overrides
- Emits standard events

---

# Installation

Copy the component file and import it:

```html
<script src="only-dropdown.js"></script>
```

or bundle it into your project.

---

# Basic Usage

```html
<only-dropdown
    data-items='[
        {"value": 1, "display": "Apple"},
        {"value": 2, "display": "Banana"},
        {"value": 3, "display": "Orange"}
    ]'
></only-dropdown>
```

Items must follow the structure:

```javascript
{
  value: any,
  display: string
}
```

---

# Usage Example

Check out included index.html

---

# Demo Page

https://snakeinsun.github.io/onlydropdown/

---

# Form Integration

The component is **form-associated**, so it works inside a form like a native input.

```html
<form>
    <only-dropdown
        name="fruit"
        data-items='[
            {"value": "apple", "display": "Apple"},
            {"value": "banana", "display": "Banana"}
        ]'
    ></only-dropdown>

    <button type="submit">Submit</button>
</form>
```

The selected `value` will be submitted with the form.

---

# Modes

## Pick Mode (default)

User must choose from the list.

```html
<only-dropdown mode="pick"></only-dropdown>
```

The input is read-only.

---

## Type Mode

User can type custom values.

```html
<only-dropdown mode="type"></only-dropdown>
```

If the typed value matches an item, that item is selected.

Otherwise a custom value is used.

---

# Attributes

| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `mode` | `pick \| type` | `pick` | Select mode |
| `filterable` | boolean | false | Enables filtering |
| `clearable` | boolean | false | Shows clear button |
| `placeholder` | string | `Select ...` | Main input placeholder |
| `filterPlaceholder` | string | `Filter ...` | Filter input placeholder |
| `data-items` | JSON | `[]` | List of dropdown items |

---

# Items

Items can be set via attribute or JavaScript.

### Attribute

```html
<only-dropdown
  data-items='[
    {"value": "us", "display": "United States"},
    {"value": "ca", "display": "Canada"}
  ]'
></only-dropdown>
```

### JavaScript

```javascript
const dropdown = document.querySelector('only-dropdown');

dropdown.items = [
  { value: 1, display: "One" },
  { value: 2, display: "Two" }
];
```

---

# Value API

### Get value

```javascript
dropdown.value
```

### Set value

```javascript
dropdown.value = 2;
```

You can also set by passing an item object.

---

# Events

### change

Triggered when an item is selected.

```javascript
dropdown.addEventListener("change", e => {
  console.log(e.detail.value);
  console.log(e.detail.display);
});
```

Event detail:

```javascript
{
  value,
  display
}
```

---

### clear

Triggered when the clear button is pressed.

```javascript
dropdown.addEventListener("clear", () => {
  console.log("value cleared");
});
```

---

# Filtering

Enable filtering:

```html
<only-dropdown filterable></only-dropdown>
```

A filter input appears at the top of the dropdown.

---

# Keyboard Controls

| Key | Action |
|----|-------|
| ArrowDown | Move highlight down |
| ArrowUp | Move highlight up |
| Enter | Select highlighted item |
| Escape | Close dropdown |

---

# Styling

The component uses **Shadow DOM**, but you can customize parts and CSS attributes.

## Parts

| Part | Description |
|----|----|
| `trigger` | wrapper |
| `main-input` | main input |
| `chevron` | dropdown arrow |
| `clear` | clear button |
| `dropdown` | dropdown window |
| `filter-input` | filter field |
| `list` | item list |
| `item` | dropdown item |

Example:

```css
only-dropdown::part(item) {
  padding: 12px;
}
```

---

# CSS Override Attributes

The component also supports inline CSS injection via attributes.

| Attribute | Description |
|----------|-------------|
| `dropdownWindowCss` | dropdown window styles |
| `itemCss` | item styles |
| `selectedItemCss` | selected item styles |
| `filterInputCss` | filter input styles |
| `filterWrapperCss` | filter wrapper styles |
| `inputCss` | main input styles |

Example:

```html
<only-dropdown
  itemCss="color: red;"
></only-dropdown>
```

---

# Dropdown Positioning

The dropdown automatically decides whether to open **above or below the trigger** based on available viewport space.

---

# Browser Support

Requires browsers supporting:

- Custom Elements
- Shadow DOM
- ElementInternals (for form association)

Supported in modern versions of:

- Chrome
- Edge
- Safari
- Firefox (partial support for form association)

---

# License

MIT