# Public read-only dashboard API
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY web-dashboard/api/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY web-dashboard/api/public_main.py main.py
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
