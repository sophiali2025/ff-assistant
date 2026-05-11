from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import startsit, gifs, leagues

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten this before deploying
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(startsit.router, prefix="/api/startsit")
app.include_router(gifs.router,     prefix="/api/gifs")
app.include_router(leagues.router,  prefix="/api/leagues")

@app.get("/")
def health():
    return {"status": "ok"}