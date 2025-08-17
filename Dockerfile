FROM python:3.12-slim

WORKDIR /app

# Evita prompts e reduz camada
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Dependências do sistema para python-docx/lxml
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libxml2-dev libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn

# Copia app
COPY app/ /app/

# Diretórios úteis
RUN mkdir -p /app/docx_templates /app/out

# Variáveis padrão (podem ser sobrescritas no compose)
ENV PORT=8000

EXPOSE 8000

# Gunicorn em produção (1 worker sync suficiente; aumente conforme demanda)
CMD ["gunicorn", "-w", "1", "-b", "0.0.0.0:8000", "app:app"]
