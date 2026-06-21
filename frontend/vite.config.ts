import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// В режиме разработки (npm run dev) запросы к /api... и эндпоинтам бэкенда
// проксируются на FastAPI (http://localhost:8000), чтобы не было проблем с CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Проксируем все API-пути бэкенда на dev-сервер FastAPI.
      "/auth": "http://localhost:8000",
      "/users": "http://localhost:8000",
      "/reviews": "http://localhost:8000",
      "/products": "http://localhost:8000",
      "/platforms": "http://localhost:8000",
      "/categories": "http://localhost:8000",
      "/sellers": "http://localhost:8000",
      "/comments": "http://localhost:8000",
      "/search": "http://localhost:8000",
      "/feedback": "http://localhost:8000",
      "/analytics": "http://localhost:8000",
      "/health": "http://localhost:8000",
    },
  },
  build: {
    // Готовая статика кладётся сюда; бэкенд раздаёт её в проде.
    outDir: "dist",
  },
});
