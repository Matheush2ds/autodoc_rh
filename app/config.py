import os
from dataclasses import dataclass

@dataclass
class Settings:
    # --- Caminhos da Aplicação ---
    # Usando os caminhos relativos como padrão, que já funcionam
    TEMPLATES_DIR: str = os.environ.get("TEMPLATES_DIR", "docx_templates")
    OUTPUT_DIR: str    = os.environ.get("OUTPUT_DIR", "generated_docs")
    DB_FILE: str       = os.environ.get("DB_FILE", "log.db")

    # --- UI ---
    APP_TITLE: str = os.environ.get("APP_TITLE", "Autodoc RH")
    
    # --- Chave Secreta ---
    # Tenta ler do ambiente, se não, usa uma chave padrão (ideal é definir no ambiente)
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "sua-chave-secreta-super-segura-aqui")

# Instância única das configurações para ser importada por outros arquivos
settings = Settings()