import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.AsyncAnthropic(
    api_key=os.environ["ANTHROPIC_API_KEY"]
)

async def ask_claude(prompt: str, max_tokens: int, system: str = None):
    kwargs = {
        "model": "claude-sonnet-4-6",
        "max_tokens": max_tokens,
        "messages": [
            {"role": "user", "content": prompt}
        ],
    }
    if system:
        kwargs["system"] = system
    response = await client.messages.create(**kwargs)
    return response.content[0].text
