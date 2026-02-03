import os
from dataclasses import dataclass

@dataclass
class Settings:
    # Caminhos absolutos baseados no Dockerfile
    TEMPLATES_DIR: str = os.environ.get("TEMPLATES_DIR", "/app/docx_templates")
    OUTPUT_DIR: str    = os.environ.get("OUTPUT_DIR", "/app/generated_docs")
    DB_FILE: str       = os.environ.get("DB_FILE", "/app/log.db")
    
    # A pasta estática será onde o React buildado está
    STATIC_FOLDER: str = os.environ.get("STATIC_FOLDER", "../frontend/dist")

    APP_TITLE: str = "Autodoc RH"
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "chave-secreta-padrao")

settings = Settings()