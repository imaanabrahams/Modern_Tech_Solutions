    # Syntax Terrorists HR System — Plain HTML/CSS/JavaScript Version

This is the converted static version of the original React/Vite HR management dashboard.

## What is included

- `index.html` — single-page app shell.
- `assets/css/styles.css` — full cyberpunk/neon styling and responsive layout.
- `assets/js/app.js` — all routing, login, dashboard, CRUD actions, filters, modals, tables, charts and toast logic in plain JavaScript.
- `assets/js/embeddedData.js` — fallback copy of the data so the app can still open directly from `index.html`.
- `data/` — JSON files used by the app:
  - `employees.json`
  - `time-off-requests.json`
  - `attendance-records.json`
  - `payroll-records.json`
  - `user.json`

## Demo login

```txt
username: admin
password: admin123
```

## How to run

Best option, from this folder:

```bash
python -m http.server 5500
```

Then open:

```txt
http://localhost:5500
```

The app also includes an embedded data fallback, so opening `index.html` directly should still work in most browsers.

## Converted functionality

- Login/logout with localStorage session.
- Dashboard with animated stat cards, SVG charts and recent leave requests.
- Employees page with search, department filter, add, edit and delete.
- Payroll page with month/year filters, process payroll action, payslip modal and download toast.
- Time Off page with request submission, status filters, approve and reject actions.
- Attendance page with date/status filters, summary cards, charts, table and export toast.
- Responsive desktop sidebar and mobile slide-out menu.
