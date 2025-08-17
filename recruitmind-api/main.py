# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/login")
def read_root(username: str = None, password: str = None):
    return {"username": username, "password": password}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import Settings
from routers.mbti_router import router as mbti_router
from routers.auth_router import router as auth_router

app = FastAPI(title="RecruitMind API", description="API for MBTI personality prediction")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=Settings().cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(mbti_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)