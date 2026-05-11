from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def leagues_placeholder():
    return {"status": "leagues router ok"}