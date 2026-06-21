import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.database import Base, engine
from app.config import settings
from app.routers import users, reviews, comments, search, feedback, analytics


def init_db():
    Base.metadata.create_all(bind=engine)
    if settings.auto_seed:
        from app.seed import run_seed

        run_seed()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Агрегатор рейтингов китайских производителей",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


app.include_router(users.router)
app.include_router(reviews.router)
app.include_router(comments.router)
app.include_router(search.router)
app.include_router(feedback.router)
app.include_router(analytics.router)


@app.get("/health")
def health():
    return {"status": "ok"}


DEFAULT_DIST = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
FRONTEND_DIST = os.path.abspath(os.environ.get("FRONTEND_DIST", DEFAULT_DIST))
ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")
INDEX_FILE = os.path.join(FRONTEND_DIST, "index.html")

if os.path.isdir(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")


@app.get("/")
def index():
    if os.path.isfile(INDEX_FILE):
        return FileResponse(INDEX_FILE)
    return JSONResponse(
        {
            "message": "Фронтенд не собран. cd frontend && npm install && npm run build",
            "api_docs": "/docs",
        }
    )


_API_PREFIXES = (
    "auth",
    "users",
    "reviews",
    "products",
    "platforms",
    "categories",
    "sellers",
    "comments",
    "search",
    "feedback",
    "analytics",
    "health",
    "docs",
    "openapi.json",
    "redoc",
    "assets",
)


@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    first = full_path.split("/")[0]
    if first in _API_PREFIXES:
        return JSONResponse({"detail": "Not Found"}, status_code=404)
    if os.path.isfile(INDEX_FILE):
        return FileResponse(INDEX_FILE)
    return JSONResponse({"detail": "Frontend not built"}, status_code=404)
