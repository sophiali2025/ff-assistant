from fastapi import APIRouter
from services.claude import ask_claude

router = APIRouter()

@router.post("/ai/test")
async def test_claude():
    message = await ask_claude("Say hello in one sentence.")
    return {"message": message}
