# Агрегационная система рейтингов китайских производителей (MVP)

Веб-приложение: пользователи оставляют отзывы о заказах из Китая, оценивая по 4 критериям
(сервис, продавец, товар, доставка). Поиск выдаёт релевантные отзывы с рекомендательным
ранжированием (content-based фильтрация — Этап A алгоритма из статьи) и сортировкой
по релевантности / баллам / дате. Есть древовидные комментарии, обратная связь и аналитика.

**Стек:** Python 3.12 · FastAPI · SQLAlchemy · SQLite (по умолчанию) / PostgreSQL (деплой) ·
фронтенд React 18 + Vite + TypeScript. Развёртывание — Docker Compose (multi-stage: один контейнер).

---

## Вариант 1. Запуск локально (для разработки)

Нужны Python 3.12 и Node.js 20.

**Шаг 1. Бэкенд** (терминал 1):
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate         # Windows  (Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Бэкенд поднимется на http://127.0.0.1:8000 (API + Swagger на /docs).
При первом запуске БД наполнится демо-данными (5 площадок, 100 товаров, 500 отзывов).

**Шаг 2. Фронтенд** (терминал 2):
```bash
cd frontend
npm install
npm run dev
```
Открой **http://localhost:5173** — это интерфейс с автоперезагрузкой.
Запросы к API проксируются на бэкенд автоматически (без CORS-проблем).

**Демо-аккаунт:** `user1@example.com` / `password123`

> Альтернатива без двух терминалов: собрать фронт один раз (`cd frontend && npm install && npm run build`),
> затем запустить только бэкенд — он сам отдаст готовую сборку на http://127.0.0.1:8000.

---

## Вариант 2. Деплой через Docker (с PostgreSQL) — одной командой

Нужен установленный Docker. Сборка multi-stage: Node собирает React-фронт,
Python отдаёт его вместе с API — всё в одном контейнере.

```bash
cd china-reviews
docker compose up --build
```

Открой **http://localhost:8000** (интерфейс) и **http://localhost:8000/docs** (API).

Остановить: `Ctrl+C`, удалить данные: `docker compose down -v`.

Для деплоя на домашний сервер через VPS-туннель см. `deploy/README-deploy.md`
и `docker-compose.prod.yml`.

> ⚠️ Перед боевым деплоем поменяй `SECRET_KEY` в `docker-compose.yml` на длинную случайную строку.

---

## Тесты

```bash
cd backend
pytest
```

---

## Структура

```
china-reviews/
├── Dockerfile                  # multi-stage: React build + FastAPI (один образ)
├── docker-compose.yml          # локальный деплой backend + PostgreSQL
├── docker-compose.prod.yml     # деплой на домашний сервер (для VPS-туннеля)
├── deploy/                     # nginx, autossh-туннель, инструкция деплоя
├── README.md
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py             # точка входа FastAPI (+ раздача React-сборки)
│       ├── config.py           # настройки (.env)
│       ├── database.py         # подключение к БД
│       ├── models.py           # таблицы (ORM)
│       ├── schemas.py          # валидация (Pydantic)
│       ├── auth.py             # регистрация, JWT
│       ├── seed.py             # демо-данные
│       ├── routers/            # эндпоинты (users, reviews, comments, search, feedback, analytics)
│       └── reco/               # рекомендательное ядро (aggregate + CBF + pipeline)
└── frontend/                   # React + Vite + TypeScript (SPA)
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx, App.tsx, styles.css
        ├── api/client.ts       # клиент к бэкенду
        ├── context/            # AuthContext
        ├── components/         # Layout, Toast, Stars, Donut/Bars
        └── pages/              # Search, Review, NewReview, Analytics, Profile, Auth
```

---

## Основные эндпоинты

| Метод | Путь | Описание |
|---|---|---|
| POST | `/auth/register` | регистрация |
| POST | `/auth/login` | вход (выдаёт JWT) |
| GET | `/search` | поиск + рекомендации (`q, category, sort, order`) |
| POST | `/reviews` | создать отзыв (4 оценки) |
| GET | `/products/{id}/reviews` | отзывы по товару |
| POST | `/comments` | комментарий / ответ |
| GET | `/reviews/{id}/comments` | дерево комментариев |
| POST | `/feedback` | «отзыв полезен» |
| GET | `/analytics/by-platform` | средние по площадкам |
| GET | `/analytics/criteria-avg` | средние по 4 критериям |

---

## Как развит алгоритм рекомендаций

Сейчас реализован **Этап A** из статьи (Лобанов, Сибиряков): агрегация многокритериальных
оценок с учётом авторитетности пользователей + content-based фильтрация (взвешенная
критериальная оценка `Score_crit` и косинусная близость профилей) + текстовая релевантность.
Итоговый ранг: `rank = α·sim + β·Score_crit + γ·relevance` (веса в `config.py`).

Поля `feedback`, `profile_attrs`, `crit_weights` уже заложены в БД для развития до
**Этапа B (Factorization Machine)** и **Этапа C (ANFIS)** — см. `Backend_подробный_план.md`.
