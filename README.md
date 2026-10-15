# EventEase — Event Management System

EventEase is a full-stack college event management project. Students can browse, search, filter, and register for campus events. Administrators can log in, create/update/delete events through protected APIs, and view dashboard statistics.

## Technology stack
- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT and bcryptjs for admin authentication
- CSS for the responsive UI
- Node.js built-in test runner for validation tests

## Requirements
- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup on Windows

### 1. Configure the backend
Open Command Prompt or a VS Code terminal at the project root:

```cmd
cd server
copy .env.example .env
npm install
```

Open `server/.env` in VS Code. Set `MONGO_URI` to your working MongoDB connection string. Replace `JWT_SECRET` with a long random secret and set a private `ADMIN_PASSWORD` of at least 12 characters. Do not share or commit `.env`.

Start the API:

```cmd
npm run dev
```

The API listens on `http://localhost:5000`. A health check is available at `http://localhost:5000/api/health`.

### 2. Create the administrator and sample events
Open a second terminal in the server folder and run:

```cmd
npm run seed-admin
```

This creates/updates the administrator using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`, and adds sample events if the event collection is empty. Keep the password private.

### 3. Start the frontend
Open a third terminal. From the project root, run:

```cmd
cd client
npm install
npm run dev
```

Open the exact Vite URL shown in the terminal (usually `http://localhost:5173`).

Important: do not run `npm install` from the project root because this project has separate `client` and `server` package.json files.

## Features
- Browse events, search by title/venue, and filter by category
- Display event dates, venue, and available seats
- Student registration with input validation, duplicate-registration prevention, and capacity checks
- Admin login with hashed password verification and JWT-protected routes
- Create, update, and delete event API endpoints
- Admin dashboard statistics
- MongoDB models for events, registrations, and administrators

## API endpoints
- `GET /api/health` — API health check
- `GET /api/events` — list events; supports `?search=` and `?category=`
- `GET /api/events/:id` — event details
- `POST /api/events/:id/register` — register a student
- `POST /api/auth/login` — admin login
- `GET /api/admin/stats` — dashboard statistics (admin token required)
- `POST /api/events` — create event (admin token required)
- `PUT /api/events/:id` — update event (admin token required)
- `DELETE /api/events/:id` — delete event (admin token required)

## Tests
Run the validation unit tests from the server folder:

```cmd
npm test
```

The tests cover valid input normalization, invalid email rejection, short-name rejection, full-capacity detection, and remaining-seat detection.

## Repository structure
- `client/` — React/Vite frontend
- `server/src/` — Express API, database models, routes, and middleware
- `server/test/` — automated validation tests
- `.gitignore` — excludes dependencies, build output, and `.env`

## Before college submission
1. Run the app locally and test the student and admin workflows.
2. Capture screenshots from your own running app.
3. Upload the project to GitHub and paste the real repository URL into the report.
4. Keep `.env` private; only commit `.env.example`.
5. Report only features and tests you actually verified.
