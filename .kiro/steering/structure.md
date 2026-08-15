---
inclusion: always
---

# Project Structure

## File layout
```
CodingCamp-10August26-Lexa/
├── index.html          # Single HTML page — all sections live here
├── css/
│   └── style.css       # Only CSS file — all styles in one place
├── js/
│   └── app.js          # Only JS file — all logic in one place
└── .kiro/
    └── steering/
        ├── product.md
        ├── tech.md
        └── structure.md
```

## Hard rules
- Exactly **one** CSS file: `css/style.css`
- Exactly **one** JavaScript file: `js/app.js`
- No additional CSS or JS files may be created
- `index.html` always stays in the project root
- `index.html` links: `<link rel="stylesheet" href="css/style.css">` and `<script src="js/app.js">`

## Code organisation inside app.js
Each feature has its own clearly labelled section with a comment block header:
```
/* --- STAGE N — FEATURE NAME --- */
```
Sections appear in this order:
1. Stage 2 — Greeting
2. Stage 3 — To-Do List
3. Stage 4 — Focus Timer
4. Stage 5 — Quick Links
5. Stage 6 — Light / Dark Mode
6. Stage 7 — Custom Name
7. Stage 8 — Custom Pomodoro Time

## Code organisation inside style.css
Sections mirror the JS order and are labelled with matching comment blocks.
CSS custom properties (variables) are defined in `:root`.
Dark mode overrides use `body.dark-mode { }`.

## Naming conventions
- HTML element IDs: camelCase (e.g. `todoInput`, `btnAddTodo`)
- CSS classes: kebab-case (e.g. `todo-item`, `btn-primary`)
- JS functions: camelCase verbs (e.g. `renderTasks`, `saveTasks`)
- JS variables: camelCase (e.g. `timerRunning`, `savedTheme`)
