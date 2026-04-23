FROM python:3.12-slim

# Устанавливаем системные библиотеки, нужные для сборки
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Команда для запуска (убедись, что main:app соответствует твоему коду)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]