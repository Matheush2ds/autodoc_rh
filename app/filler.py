from docx import Document
from pathlib import Path
import os

def fill_all_templates(templates_dir: str, output_dir: str, data_map: dict, filename_suffix: str = ""):
    """
    Percorre todos os .docx em templates_dir, substitui os placeholders encontrados
    e salva em output_dir. Retorna lista de caminhos gerados.
    """
    out_files = []
    for entry in Path(templates_dir).glob("*.docx"):
        doc = Document(str(entry))

        replace_in_document(doc, data_map)

        out_name = f"{entry.stem}{filename_suffix}.docx"
        out_path = Path(output_dir) / out_name
        doc.save(str(out_path))
        out_files.append(str(out_path))

    return out_files

def replace_in_document(doc, data_map: dict):
    """
    Substitui placeholders em parágrafos e tabelas.
    Observação: ao substituir em nível de parágrafo consolidando runs,
    pode haver perda mínima de formatação local de trechos.
    """
    # Parágrafos
    for p in doc.paragraphs:
        replace_in_paragraph(p, data_map)

    # Tabelas
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    replace_in_paragraph(p, data_map)

def replace_in_paragraph(paragraph, data_map: dict):
    """
    Junta o texto de todos os runs, faz as substituições e redefine paragraph.text.
    """
    if not paragraph.runs:
        return
    text = "".join(run.text for run in paragraph.runs)
    new_text = replace_all(text, data_map)
    if new_text != text:
        paragraph.clear()  # remove runs existentes
        paragraph.add_run(new_text)

def replace_all(text: str, data_map: dict) -> str:
    for k, v in data_map.items():
        if v is None:
            v = ""
        text = text.replace(k, v)
    return text
