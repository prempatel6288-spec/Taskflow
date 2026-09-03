import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { db } from './db.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:4200' }));
app.use(express.json());

const statuses = ['todo', 'in_progress', 'done'];
const priorities = ['low', 'medium', 'high'];
const taskQuery = `SELECT tasks.*, projects.name AS project_name, projects.color AS project_color
  FROM tasks JOIN projects ON projects.id = tasks.project_id`;

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/projects', (_req, res) => res.json(db.prepare('SELECT * FROM projects ORDER BY id').all()));

app.get('/api/tasks', (req, res) => {
  const where: string[] = [];
  const values: Record<string, string> = {};
  if (req.query.projectId) { where.push('tasks.project_id = @projectId'); values.projectId = String(req.query.projectId); }
  if (req.query.status) { where.push('tasks.status = @status'); values.status = String(req.query.status); }
  const sql = `${taskQuery}${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY tasks.updated_at DESC, tasks.id DESC`;
  res.json(db.prepare(sql).all(values));
});

app.post('/api/tasks', (req, res) => {
  const { title, description = '', projectId, status = 'todo', priority = 'medium', owner = null, dueDate = null } = req.body;
  if (typeof title !== 'string' || !title.trim() || !Number.isInteger(projectId) || !statuses.includes(status) || !priorities.includes(priority)) {
    return res.status(400).json({ error: 'title, projectId, status, and priority are required with valid values.' });
  }
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
  if (!project) return res.status(400).json({ error: 'projectId does not reference an existing project.' });
  const result = db.prepare(`INSERT INTO tasks (title, description, project_id, status, priority, owner, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(title.trim(), description, projectId, status, priority, owner, dueDate);
  const task = db.prepare(`${taskQuery} WHERE tasks.id = ?`).get(result.lastInsertRowid);
  return res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const current = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!current) return res.status(404).json({ error: 'Task not found.' });
  const next = { ...current, ...req.body } as Record<string, unknown>;
  if (typeof next.title !== 'string' || !next.title.trim() || !statuses.includes(String(next.status)) || !priorities.includes(String(next.priority))) {
    return res.status(400).json({ error: 'Invalid task update.' });
  }
  db.prepare(`UPDATE tasks SET title = ?, description = ?, project_id = ?, status = ?, priority = ?, owner = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(next.title.trim(), next.description ?? '', next.project_id, next.status, next.priority, next.owner ?? null, next.due_date ?? null, id);
  return res.json(db.prepare(`${taskQuery} WHERE tasks.id = ?`).get(id));
});

app.get('/api/metrics', (_req, res) => {
  const metrics = db.prepare(`SELECT
    COUNT(*) AS total_tasks,
    SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed_tasks,
    SUM(CASE WHEN due_date < date('now') AND status != 'done' THEN 1 ELSE 0 END) AS overdue_tasks
    FROM tasks`).get();
  res.json(metrics);
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error.' });
});

if (process.env.NODE_ENV !== 'test') app.listen(port, () => console.log(`Task Tracker API listening at http://localhost:${port}`));
export { app };

