import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.AsyncAnthropic(
    api_key=os.environ["ANTHROPIC_API_KEY"]
)

async def ask_claude(prompt: str, max_tokens: int):
    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return response.content[0].text
