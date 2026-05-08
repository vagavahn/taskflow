# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

No build step. Open `html/index.html` directly in a browser, or serve with any static file server:

```
npx serve .
# or
python3 -m http.server
```

## Architecture

Single-page application. All views live as `.content-wrapper` `<div>`s in `html/index.html`, all hidden by default. Navigation works by hiding all wrappers then showing the target one:

```javascript
$(".content-wrapper").hide();
$("#div-tasks").show();
```

The backend is a single AWS Lambda function exposed via API Gateway. The base URL is `endpoint01` at the top of `js/app.js`. Endpoints: `/login`, `/signup`, `/tasks` (GET), `/task` (POST/PUT/DELETE), `/adminreport`.

Auth tokens are stored in `localStorage` and injected into hidden form fields (`#formaddtasktoken`, `#tasks_token`, `#edit_token`) on login and page load. Nav items with `.secured` are hidden (`.locked`) until login succeeds, then get `.unlocked`.

**`js/app.js` is always structured in three sections:**
1. Constants/declarations at the top
2. Controller functions (all Ajax calls, form validation, DOM manipulation happen here)
3. `$(document).ready()` — startup logic and click handlers only

## Course Rules (Mandatory — Override General Knowledge)

This is a course project. These rules are non-negotiable.

**Philosophy:** Simplicity and readability for novice programmers over efficiency or security.

### HTML/CSS
- Bootstrap 5 must be used for layout and styling
- Font Awesome may be used for icons
- `<script>` tags go in `<head>` — never in or below `<body>`
- Avoid inline JavaScript in HTML; the only exception is the `onclick` attribute

### JavaScript
- No `alert()` — ever
- Prefer `let` over `var`
- Do not use `===` unless explicitly directed
- Use square bracket notation for JSON: `results[0]['taskname']` not `results[0].taskname`

### jQuery (Strict)
- All DOM manipulation must use jQuery — no vanilla DOM methods
- Use only `#id` and `.class` selectors
- `.text()` is **forbidden** — always use `.html()`
- **Method chaining is forbidden.** Each jQuery action must be its own statement:

```javascript
// Correct
$("#message").html("Task Complete");
$("#message").addClass("alert alert-success");

// FORBIDDEN
$("#message").html("Task Complete").addClass("alert alert-success");
```

### Ajax
- Always use `$.ajax()` with keys: `url`, `data`, `method`, `success`, `error`
- Always `console.log` `the_serialized_data` before the call and `results` inside the callback
- Always use `$("#form-id").serialize()` — never build query strings manually
- Use arrow functions for `success` and `error` callbacks

### Click Handlers
- Must be kept very short — delegate all logic to a controller function
- May contain at most five simple jQuery statements
- Controllers handle: validation, serialization, Ajax, and DOM updates
