import os
from dataclasses import dataclass

@dataclass
class Settings:
    # Diretório com modelos .docx
    TEMPLATES_DIR: str = os.environ.get("TEMPLATES_DIR", "/app/docx_templates")
    # Saída padrão (dentro do container)
    OUTPUT_DIR: str = os.environ.get("OUTPUT_DIR", "/app/out")
    # Pasta de rede montada (opcional, montar via host/compose)
    OUTPUT_NETWORK_DIR: str = os.environ.get("OUTPUT_NETWORK_DIR", os.environ.get("NETWORK_DIR", ""))

    # UI
    APP_TITLE: str = os.environ.get("APP_TITLE", "DocRH - Gerador de Documentos")
