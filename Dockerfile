FROM python:3.11-slim


ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH=/app

RUN pip install --upgrade pip
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . /app

EXPOSE 8000

# alembic revision --autogenerate -m "Initial revision"
# alembic upgrade head

CMD uvicorn wood_app.main:app --host 0.0.0.0 --port 8000 --reload