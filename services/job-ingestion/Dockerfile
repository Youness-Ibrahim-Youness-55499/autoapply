FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /service
COPY pyproject.toml README.md ./
COPY joblab ./joblab
COPY config ./config
COPY data ./data
COPY web ./web
RUN pip install --no-cache-dir .

EXPOSE 5184
CMD ["uvicorn", "joblab.api:app", "--host", "0.0.0.0", "--port", "5184"]
