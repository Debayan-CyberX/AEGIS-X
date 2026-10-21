FROM node:22-alpine AS frontend
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV STATIC_EXPORT=true NEXT_PUBLIC_SAME_ORIGIN_API=true NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 COOKIE_SECURE=true STATIC_DIR=/app/static
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=frontend /build/out /app/static
RUN useradd --create-home aegis && chown -R aegis:aegis /app
USER aegis
EXPOSE 10000
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.hosted:app --host 0.0.0.0 --port ${PORT:-10000} --workers 1"]
