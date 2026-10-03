import { neon } from '@neondatabase/serverless';

const TASK_ID = /^2026-10-(0[1-9]|[12]\d|3[01])-\d+$/;

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  const sql = neon(process.env.DATABASE_URL);
  await sql`
    CREATE TABLE IF NOT EXISTS study_progress (
      task_id TEXT PRIMARY KEY,
      checked BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return sql;
}

async function getProgress(sql) {
  const rows = await sql`SELECT task_id, checked FROM study_progress`;
  return Object.fromEntries(rows.map(row => [row.task_id, row.checked]));
}

export default async function handler(req, res) {
  try {
    const sql = await db();

    if (req.method === 'GET') {
      return json(res, 200, { progress: await getProgress(sql) });
    }

    if (req.method === 'POST') {
      const { id, checked } = req.body || {};

      if (typeof id !== 'string' || !TASK_ID.test(id) || typeof checked !== 'boolean') {
        return json(res, 400, { error: 'Invalid progress update' });
      }

      await sql`
        INSERT INTO study_progress (task_id, checked, updated_at)
        VALUES (${id}, ${checked}, NOW())
        ON CONFLICT (task_id)
        DO UPDATE SET checked = EXCLUDED.checked, updated_at = NOW()
      `;

      return json(res, 200, { progress: await getProgress(sql) });
    }

    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'Progress sync is unavailable' });
  }
}
