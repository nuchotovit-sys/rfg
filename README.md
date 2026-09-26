# Telegram-бот для игры

Бот на команду `/start` присылает кнопку **Open App**, которая открывает сайт с игрой
прямо внутри Telegram (через Telegram WebApp). Каждый пользователь при первом
(и каждом следующем) `/start` сохраняется в базу данных Postgres — это и есть
"привязка к аккаунту в Telegram": по `telegram_id` сайт может понять, кто именно
открыл игру (Telegram передаёт данные пользователя в `initData` внутри WebApp).

## Структура проекта

```
src/
  index.js     — точка входа: миграции + запуск бота + health-check сервер
  bot.js       — логика бота (/start, кнопка Open App, запись в БД)
  db.js        — подключение к Postgres
  migrate.js   — применение SQL-миграций при старте
migrations/
  001_init.sql — таблица users
```

## Деплой на Railway

1. **Залейте эту папку в новый репозиторий на GitHub** (обычный `git init`, `git add .`,
   `git commit`, `git push`).

2. **Создайте проект на [railway.app](https://railway.app)**:
   - New Project → Deploy from GitHub repo → выберите ваш репозиторий.

3. **Добавьте базу данных**: в том же проекте Railway нажмите `+ New` → `Database` →
   `Add PostgreSQL`. Railway сам создаст базу и подставит переменную `DATABASE_URL`
   всем сервисам в проекте — вручную её указывать не нужно.

4. **Задайте переменные окружения** для сервиса бота (вкладка Variables):
   - `BOT_TOKEN` — токен бота от @BotFather.
   - `GAME_URL` — https-ссылка на сайт с игрой (обязательно `https://`, иначе
     Telegram откажется открывать WebApp-кнопку).

   `DATABASE_URL` и `PORT` Railway выставит сам.

5. **Deploy**. Railway прочитает `railway.json`, установит зависимости и выполнит
   `npm start`. При старте бот сам применит SQL-миграции (создаст таблицу `users`),
   после чего начнёт принимать сообщения через long polling — отдельный webhook
   настраивать не нужно.

6. Проверьте бота в Telegram: `/start` → должна появиться кнопка **Open App**.

## Локальный запуск (для проверки)

```bash
cp .env.example .env
# впишите свой BOT_TOKEN, GAME_URL и DATABASE_URL в .env
npm install
npm start
```

## Важно про безопасность токена

Токен бота — секрет уровня пароля: с ним можно полностью управлять ботом.
- Не коммитьте `.env` в git (он уже в `.gitignore`).
- Храните `BOT_TOKEN` только в переменных окружения Railway.
- Токен из этого чата уже был показан здесь в открытом виде — если хотите
  перестраховаться, можно в любой момент зайти в @BotFather → `/mybots` →
  выбрать бота → `API Token` → `Revoke current token`, получить новый и
  обновить переменную `BOT_TOKEN` на Railway.

## Если нужен не WebApp, а обычная ссылка

Кнопка сделана через `Markup.button.webApp(...)` — она открывает сайт как
мини-приложение внутри Telegram и даёт доступ к `window.Telegram.WebApp.initData`
на сайте (это и нужно для привязки аккаунта). Если вместо этого нужна просто
обычная кнопка-ссылка, открывающая сайт во внешнем браузере, замените в
`src/bot.js` строку:

```js
Markup.button.webApp('🎮 Open App', GAME_URL)
```

на:

```js
Markup.button.url('🎮 Open App', GAME_URL)
```
