from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def startsit_placeholder():
    return {"status": "startsit router ok"}