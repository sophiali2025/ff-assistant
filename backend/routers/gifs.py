from fastapi import APIRouter

router = APIRouter()

@router.get("/search")
def gifs_placeholder():
    return {"status": "gifs router ok"}