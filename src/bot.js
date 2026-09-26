import { Telegraf, Markup } from 'telegraf';
import { pool } from './db.js';

const BOT_TOKEN = process.env.BOT_TOKEN;
const GAME_URL = process.env.GAME_URL;

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN не задан.');
  process.exit(1);
}
if (!GAME_URL || !GAME_URL.startsWith('https://')) {
  console.error('GAME_URL не задан или не начинается с https:// (обязательно для Telegram WebApp).');
  process.exit(1);
}

export const bot = new Telegraf(BOT_TOKEN);

async function upsertUser(from) {
  await pool.query(
    `INSERT INTO users (telegram_id, username, first_name, last_name, language_code)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (telegram_id) DO UPDATE SET
       username = EXCLUDED.username,
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       language_code = EXCLUDED.language_code,
       last_seen_at = now(),
       starts_count = users.starts_count + 1`,
    [from.id, from.username ?? null, from.first_name ?? null, from.last_name ?? null, from.language_code ?? null]
  );
}

bot.start(async (ctx) => {
  try {
    await upsertUser(ctx.from);
  } catch (err) {
    console.error('Не удалось сохранить пользователя в базу:', err);
  }

  await ctx.reply(
    'Привет! Жми кнопку ниже, чтобы открыть игру.',
    Markup.inlineKeyboard([
      Markup.button.webApp('🎮 Open App', GAME_URL),
    ])
  );
});

bot.help((ctx) =>
  ctx.reply('Команда /start откроет игру прямо внутри Telegram.')
);

bot.catch((err, ctx) => {
  console.error(`Ошибка у бота для обновления ${ctx.updateType}:`, err);
});
