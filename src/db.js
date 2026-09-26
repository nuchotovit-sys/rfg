import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL не задан. Добавьте базу данных Postgres и переменную окружения.');
  process.exit(1);
}

// Railway обычно требует SSL для внешних подключений, но не для внутренних
// (когда бот и база в одном проекте). rejectUnauthorized: false работает в обоих случаях.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

export async function query(text, params) {
  return pool.query(text, params);
}
