# Фронтенд (React + Vite + TypeScript)

SPA для агрегатора рейтингов. Общается с FastAPI-бэкендом.

## Разработка (с автоперезагрузкой)

Нужен запущенный бэкенд на http://localhost:8000 (`uvicorn app.main:app` в папке backend).

```bash
cd frontend
npm install
npm run dev
```
Откроется http://localhost:5173. Запросы к API проксируются на бэкенд (см. vite.config.ts),
поэтому проблем с CORS нет.

## Сборка для продакшна

```bash
npm run build
```
Готовая статика появится в `frontend/dist/`. В продакшне её отдаёт сам FastAPI
(через переменную FRONTEND_DIST или путь по умолчанию). При деплое через Docker
сборка выполняется автоматически (multi-stage Dockerfile в корне репозитория).

## Структура

```
src/
  main.tsx              точка входа (Router + провайдеры)
  App.tsx               маршруты
  styles.css            оформление
  api/client.ts         клиент к бэкенду (fetch + JWT)
  context/AuthContext   состояние пользователя
  components/           Layout, Toast, Stars, Donut/Bars
  pages/                Search, Review, NewReview, Analytics, Profile, Auth
```

## Стек
- React 18 + TypeScript
- Vite (dev-сервер и сборщик)
- React Router (клиентская маршрутизация)
- Контекст React для auth и toast (без внешних state-библиотек)
- Графики — собственные компоненты на inline-SVG/CSS (без сторонних chart-библиотек)
