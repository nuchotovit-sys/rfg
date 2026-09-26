-- Таблица пользователей, привязанных к боту.
-- telegram_id — уникальный идентификатор пользователя Telegram,
-- это и есть "привязка к аккаунту": сайт с игрой сможет узнавать
-- игрока по этому id (переданному через Telegram WebApp initData).
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  starts_count INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id);
