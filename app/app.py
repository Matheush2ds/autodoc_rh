import os
import shutil
import zipfile
from datetime import datetime, date
from io import BytesIO
from pathlib import Path
from flask import Flask, render_template, request, send_file, redirect, url_for, flash
from docx import Document
from werkzeug.utils import secure_filename

# ==================== Configurações do Aplicativo ====================
APP_TITLE = "Autodoc_Rh"
TEMPLATES_DIR = "docx_templates"
OUTPUT_DIR = "generated_docs"
OUTPUT_NETWORK_DIR = None  # Defina pasta de rede se houver
LOG_FILE = 'docs_log.txt'

app = Flask(__name__)
app.secret_key = "uma_chave_secreta_aqui"

# ==================== Funções de Dashboard e Log ====================
def log_document():
    """Registra a geração de um documento no arquivo de log."""
    with open(LOG_FILE, 'a') as f:
        f.write(f"{datetime.now().isoformat()}\n")

def count_documents():
    """Conta os documentos gerados hoje e no mês a partir do arquivo de log."""
    if not os.path.exists(LOG_FILE):
        return 0, 0
    
    hoje = date.today().isoformat()
    mes_atual = date.today().strftime('%Y-%m')
    
    hoje_count = 0
    mes_count = 0
    
    with open(LOG_FILE, 'r') as f:
        for line in f:
            doc_date_str = line.strip()
            if doc_date_str:
                doc_date = doc_date_str[:10]
                doc_month = doc_date_str[:7]
                
                if doc_date == hoje:
                    hoje_count += 1
                if doc_month == mes_atual:
                    mes_count += 1
                    
    return hoje_count, mes_count

# ==================== Funções auxiliares ====================
def sanitize_filename(name):
    return secure_filename(name.replace(" ", "_"))

def fill_template(template_path, output_path, data_map):
    try:
        document = Document(template_path)
        for paragraph in document.paragraphs:
            for placeholder, value in data_map.items():
                paragraph.text = paragraph.text.replace(placeholder, str(value))
        for table in document.tables:
            for row in table.rows:
                for cell in row.cells:
                    for paragraph in cell.paragraphs:
                        for placeholder, value in data_map.items():
                            paragraph.text = paragraph.text.replace(placeholder, str(value))
        document.save(output_path)
        return True
    except Exception as e:
        print(f"Erro ao preencher {template_path}: {e}")
        return False

def fill_all_templates(templates_dir, output_dir, data_map, filename_suffix=""):
    generated_files = []
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    for template_name in os.listdir(templates_dir):
        if template_name.endswith('.docx'):
            template_path = os.path.join(templates_dir, template_name)
            base_name, ext = os.path.splitext(template_name)
            output_filename = f"{base_name}{filename_suffix}{ext}"
            output_path = os.path.join(output_dir, output_filename)
            if fill_template(template_path, output_path, data_map):
                generated_files.append(output_path)
    return generated_files

# ==================== Rotas Flask ====================
# Rota para o Dashboard (página inicial)
@app.route("/")
@app.route("/dashboard")
def dashboard():
    enviados_hoje, enviados_mes = count_documents()
    return render_template("dashboard.html", enviados_hoje=enviados_hoje, enviados_mes=enviados_mes)

# Rota para o formulário de geração de documentos
@app.route("/form")
def form():
    return render_template("form.html")

# Rota para gerar o documento
@app.route("/generate", methods=["POST"])
def generate():
    form_fields = ["name","cargo","cpf","rg","orgao","mes","empresa","setor","salario",
                   "estadocivil","nacionalidade","endereco","cnpj","horario"]
    data = {f: request.form.get(f,"").strip() for f in form_fields}

    if not data["name"]:
        flash("O campo Nome é obrigatório.", "error")
        return redirect(url_for("form"))

    current_date = datetime.now().strftime("%d/%m/%Y")

    data_map = {
        "<name_id>": data["name"],
        "<cargo_id>": data["cargo"],
        "<cpf_id>": data["cpf"],
        "<rg_id>": data["rg"],
        "<orgao_id>": data["orgao"],
        "<mes_id>": data["mes"],
        "<empresa_id>": data["empresa"],
        "<setor_id>": data["setor"],
        "<salario_id>": data["salario"],
        "<estadocivil_id>": data["estadocivil"],
        "<nacionalidade_id>": data["nacionalidade"],
        "<endereco_id>": data["endereco"],
        "<cnpj_id>": data["cnpj"],
        "<horario_id>": data["horario"],
        "<date_id>": current_date,
    }

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir = Path(OUTPUT_DIR) / f"{timestamp}_{sanitize_filename(data['name'])}"

    generated_files = fill_all_templates(TEMPLATES_DIR, str(run_dir), data_map,
                                         filename_suffix=f"_{sanitize_filename(data['name'])}")

    if not generated_files:
        flash("Nenhum .docx encontrado em 'docx_templates'.", "error")
        return redirect(url_for("form"))

    if OUTPUT_NETWORK_DIR:
        try:
            Path(OUTPUT_NETWORK_DIR).mkdir(parents=True, exist_ok=True)
            for f in generated_files:
                shutil.copy2(f, Path(OUTPUT_NETWORK_DIR) / Path(f).name)
            flash("Documentos salvos com sucesso na pasta de rede!", "success")
        except Exception as e:
            flash(f"Erro ao salvar na pasta de rede: {e}", "error")

    log_document()

    mem_zip = BytesIO()
    with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for f in generated_files:
            zf.write(f, arcname=Path(f).name)
    mem_zip.seek(0)

    zip_name = f"docs_{sanitize_filename(data['name'])}_{timestamp}.zip"
    flash("Documentos gerados com sucesso e prontos para download!", "success")
    return send_file(mem_zip, as_attachment=True, download_name=zip_name, mimetype="application/zip")

if __name__ == "__main__":
    if not os.path.exists(LOG_FILE):
        open(LOG_FILE, 'a').close()
    Path(TEMPLATES_DIR).mkdir(parents=True, exist_ok=True)
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    
    app.run(debug=True)