# eComBack Shop Frontend

Production-ready фронтенд интернет-магазина на Next.js (App Router) с интеграцией в FastAPI backend (`eComBack`).

## Стек
- Next.js + TypeScript
- Tailwind CSS
- Модульный API-слой (`lib/api`)
- Локальное состояние с Context (auth/cart)
- Обработка refresh токена и авто-повтор запроса на 401/403

## Архитектура
- `app/` — страницы магазина, auth и admin route-group
- `components/` — layout, auth, product UI
- `features/auth`, `features/cart` — бизнес состояние
- `lib/api` — API-клиент, запросы к endpoint
- `types` — единые типы API

## Переменные окружения
Создайте `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Запуск
```bash
npm install
npm run dev
```

## Принятые решения
- Access token хранится in-memory (не пишется в localStorage), чтобы снизить риск XSS-эксфильтрации.
- Refresh token хранится в localStorage как fallback в SPA-потоке; при 401/403 выполняется `POST /auth/refresh` и повтор запроса.
- Все запросы проходят через единый клиент с унифицированным форматом ошибок.
- Для отсутствующих API-деталей в UI применены безопасные placeholder-состояния (например, изображения и описания).
