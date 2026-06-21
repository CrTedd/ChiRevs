# Multi-stage сборка: Node собирает React-фронт -> Python отдаёт его и API.
# Это даёт ОДИН контейнер для всего приложения.
# Контекст сборки — корень репозитория (china-reviews/).

# ---------- Stage 1: сборка фронтенда ----------
FROM node:20-slim AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build
# Результат: /fe/dist

# ---------- Stage 2: бэкенд ----------
FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# Копируем собранный фронт и указываем бэкенду, где он лежит.
COPY --from=frontend /fe/dist ./frontend_dist
ENV FRONTEND_DIST=/app/frontend_dist

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
