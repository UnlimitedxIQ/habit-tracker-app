from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    from database import init_db
    await init_db()
    yield


app = FastAPI(title="Habit Tracker API", lifespan=lifespan, redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import habits, completions  # noqa: E402
app.include_router(habits.router)
app.include_router(completions.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
