from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import Settings
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="RecruitMind API")


from routers.mbti_router import router as mbti_router
from routers.auth_router import router as auth_router
from routers.candidates_router import router as candidates_router


# Routers
app.include_router(mbti_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(candidates_router, prefix="/api/v1")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods: GET, POST, PUT, DELETE, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"],  # Exposes all headers to the browser
)
