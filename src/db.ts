import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const databasePath = process.env.DATABASE_PATH ?? join(root, 'data', 'task-tracker.db');
mkdirSync(dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);
db.pragma('foreign_keys = ON');
db.exec(readFileSync(join(root, 'sql', 'schema.sql'), 'utf8'));

const projectCount = db.prepare('SELECT COUNT(*) AS count FROM projects').get() as { count: number };
if (projectCount.count === 0) {
  const seed = db.transaction(() => {
    db.prepare('INSERT INTO projects (name, description, color) VALUES (?, ?, ?)').run('Product Launch', 'Fictional planning workspace for the demo.', '#6D5EF7');
    db.prepare('INSERT INTO projects (name, description, color) VALUES (?, ?, ?)').run('Platform Reliability', 'Fictional engineering work for the demo.', '#14B8A6');
    const insertTask = db.prepare(`INSERT INTO tasks (title, description, project_id, status, priority, owner, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    insertTask.run('Define release checklist', 'Create a shared definition of ready for the fictional launch.', 1, 'todo', 'high', 'Alex Chen', '2026-09-12');
    insertTask.run('Review onboarding flow', 'Validate key hand-offs in the demo product journey.', 1, 'in_progress', 'medium', 'Jordan Kim', '2026-09-09');
    insertTask.run('Draft launch brief', 'Summarize scope, owners, and timeline for the demonstration.', 1, 'done', 'high', 'Alex Chen', '2026-09-05');
    insertTask.run('Add API health check', 'Expose a lightweight readiness endpoint for the sample API.', 2, 'done', 'medium', 'Sam Rivera', '2026-09-04');
    insertTask.run('Document incident workflow', 'Write a concise fictional incident response playbook.', 2, 'todo', 'low', 'Sam Rivera', '2026-09-16');
  });
  seed();
}

