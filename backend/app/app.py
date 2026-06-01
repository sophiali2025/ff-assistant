from main import app
from routers.sleeper import router as sleeper_router
from routers.projections import router as projections_router
from routers.gifs import router as gifs_router
from routers.leagues import router as leagues_router
from routers.startsit import router as startsit_router
from routers.ai import router as ai_router

# Register all routers with the app.
# Each router file defines its own routes using APIRouter.
app.include_router(sleeper_router)
app.include_router(projections_router)
app.include_router(gifs_router, prefix="/gifs")
app.include_router(leagues_router, prefix="/leagues")
app.include_router(startsit_router, prefix="/startsit")
app.include_router(ai_router)
