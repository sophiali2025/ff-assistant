from dotenv import load_dotenv
load_dotenv()  # loads .env variables into os.environ — must run before other imports

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    # Add more origins here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    #            folder.file:app  run on any domian
    uvicorn.run("app.routes:app", host = "0.0.0.0", port = 8000, reload = True)