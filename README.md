# Team Task Tracker

A portfolio-quality, full-stack task-management application built with **Angular, Node.js, TypeScript, SQL, REST APIs, and AWS deployment status**

## Features

- Kanban-style task board grouped by status
- Create tasks with project, priority, owner, and due date
- Move tasks across statuses through the REST API
- SQL schema, constraints, indexes, and demonstrative seed data
- Lightweight operational dashboard: task count, overdue tasks, and completion rate
- Angular standalone frontend and TypeScript/Express API
- Optional AWS deployment notes; no cloud resources or credentials are required locally

## Architecture

```
Angular client  →  Express REST API  →  SQLite database
  localhost:4200      localhost:3000      data/task-tracker.db
```

## Run locally

Requires Node.js 20+ and npm.

```bash
# Terminal 1 — API
cd team-task-tracker
npm install
npm run dev

# Terminal 2 — Angular client
cd team-task-tracker/client
npm install
npm start
```

Open `http://localhost:4200`. The API runs at `http://localhost:3000`.

The server creates the local SQLite database and demo seed data automatically on first run.

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/projects` | List projects |
| `GET` | `/api/tasks` | List tasks; optional `projectId`, `status` |
| `POST` | `/api/tasks` | Create a task |
| `PATCH` | `/api/tasks/:id` | Update task fields or status |
| `GET` | `/api/metrics` | Dashboard metrics |

Example task creation:

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Draft project brief","projectId":1,"priority":"medium","status":"todo"}'
```

## Tests

With the API dependencies installed:

```bash
npm test
```
## Deployment Status

This project was previously deployed on AWS as a full-stack application. The deployed environment is no longer active. However, the repository retains the local development setup and AWS deployment guidance for recreating the environment when needed :)


