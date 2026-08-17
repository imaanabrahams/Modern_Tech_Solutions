# Modern Tech Solutions HR System — Combined Full-Stack Application

This combined project uses the Modern Tech Solutions frontend styling/UI with the HR System's Express + SQLite backend and JWT authentication.

## Project structure

- `backend/` — Express API, SQLite database, JWT authentication and CRUD routes.
- `frontend/` — Modern Tech Solutions HTML/CSS/JavaScript UI.
- `frontend/assets/js/app.js` — API-backed application logic.
- `frontend/data/` — original static data files retained from the frontend project.
- `backend/seed/` — database seed data used by the backend.

## Requirements

- Node.js 18+
- npm

## Run

1. Open a terminal in `backend/`.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env`.
4. Set `JWT_SECRET` in `.env`.
5. Start the application:

```bash
npm start
```

6. Open `http://localhost:3000`.

## Demo login

```txt
username: admin
password: admin123
```

The frontend calls the backend API for authentication and data operations. The SQLite database is created and seeded automatically on first startup.

## Important

The original Modern Tech Solutions CSS and visible application text have been retained. The static frontend data is retained for reference, while the running application uses the backend API and SQLite database so CRUD operations persist correctly.
