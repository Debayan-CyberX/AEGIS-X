"""Single-origin deployment of the API and exported frontend."""
import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# Set the origin before the API imports its policy.
if os.getenv("RENDER_EXTERNAL_URL"):
    os.environ.setdefault("CORS_ORIGINS", os.environ["RENDER_EXTERNAL_URL"])

from .main import app as api, lifespan

app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
app.mount("/api", api)
app.mount("/", StaticFiles(directory=os.getenv("STATIC_DIR", "/app/static"), html=True))
