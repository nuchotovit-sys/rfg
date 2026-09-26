import 'dotenv/config';
import express from 'express';
import { runMigrations } from './migrate.js';
import { bot } from './bot.js';

async function main() {
  await runMigrations();

  await bot.launch();
  console.log('Бот запущен (long polling).');

  // Небольшой HTTP-сервер только для health-check Railway,
  // сам бот работает через long polling и публичный порт ему не нужен.
  const app = express();
  app.get('/', (_req, res) => res.send('Bot is running'));
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Health-check сервер слушает порт ${port}`));
}

main().catch((err) => {
  console.error('Не удалось запустить бота:', err);
  process.exit(1);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
