---
inclusion: always
---

# Tech Stack

## Languages
- HTML5 — semantic structure
- CSS3 — styling and layout (custom properties, flexbox, grid)
- Vanilla JavaScript (ES6+) — all logic and interactivity

## Hard constraints
- No frameworks (no React, Vue, Angular, Svelte, etc.)
- No CSS frameworks (no Bootstrap, Tailwind, etc.)
- No external libraries or CDN dependencies
- No backend server
- No build tools or bundlers

## Browser APIs used
- `localStorage` — persists tasks, links, theme, user name, and Pomodoro duration
- `setInterval` / `Date` — live clock and countdown timer

## Data stored in Local Storage
| Key            | Type   | Description                        |
|----------------|--------|------------------------------------|
| `tasks`        | Array  | To-do items `{ id, text, completed }` |
| `links`        | Array  | Quick links `{ id, name, url }`    |
| `theme`        | String | `"light"` or `"dark"`             |
| `userName`     | String | Custom greeting name               |
| `pomodoroTime` | Number | Timer duration in minutes          |

## Browser compatibility
Modern browsers only (Chrome, Firefox, Edge, Safari latest).
