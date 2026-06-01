import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.environ["GEMINI_API_KEY"]
)

async def ask_gemini(prompt: str, system: str = None):
    config = {}
    if system:
        config["system_instruction"] = system

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
        config=config,
    )

    return response.text