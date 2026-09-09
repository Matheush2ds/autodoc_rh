# Estágio 1: Build do Frontend (React)
FROM node:20-alpine AS frontend-builder
WORKDIR /app_frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Estágio 2: Backend (Python)
FROM python:3.11-slim

WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia código fonte do Backend
COPY app/ ./app/

# --- CORREÇÃO IMPORTANTE AQUI ---
# Copia a pasta de templates da sua máquina para dentro do container
COPY docx_templates/ ./docx_templates/

# Cria pasta de saída
RUN mkdir -p generated_docs

# Copia o build do React
COPY --from=frontend-builder /app_frontend/dist ./frontend/dist

# Variáveis de Ambiente
ENV TEMPLATES_DIR=/app/docx_templates
ENV OUTPUT_DIR=/app/generated_docs
ENV DB_FILE=/app/log.db
ENV FLASK_APP=app/app.py

EXPOSE 5000

CMD ["python", "app/app.py"]