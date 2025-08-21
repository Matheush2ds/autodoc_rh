import os
import shutil
import zipfile
import locale
from datetime import datetime, date, timedelta
from io import BytesIO
from pathlib import Path
from collections import defaultdict
from flask import Flask, render_template, request, send_file, redirect, url_for, flash, session
from werkzeug.utils import secure_filename
from docxtpl import DocxTemplate

APP_TITLE = "Autodoc_Rh"
TEMPLATES_DIR = "docx_templates"
OUTPUT_DIR = "generated_docs"
OUTPUT_NETWORK_DIR = None
LOG_FILE = 'docs_log.txt'

app = Flask(__name__)
app.secret_key = "uma_chave_secreta_aqui"

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

def count_documents_last_7_days():
    """Conta os documentos gerados nos últimos 7 dias."""
    count = 0
    hoje = datetime.now().date()
    
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as f:
            for line in f:
                try:
                    log_date = datetime.fromisoformat(line.strip()).date()
                    if hoje - log_date < timedelta(days=7):
                        count += 1
                except ValueError:
                    continue
    return count

def sanitize_filename(name):
    """Limpa o nome do arquivo para torná-lo seguro."""
    return secure_filename(name.replace(" ", "_"))

def fill_template_docxtpl(template_path, output_path, context):
    """Preenche um único template DOCX com os dados fornecidos."""
    try:
        doc = DocxTemplate(template_path)
        doc.render(context)
        doc.save(output_path)
        return True
    except Exception as e:
        print(f"Erro ao preencher {template_path} com docxtpl: {e}")
        return False

def fill_all_templates_docxtpl(templates_dir, output_dir, context, filename_suffix=""):
    """Preenche todos os templates DOCX em um diretório."""
    generated_files = []
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    for template_name in os.listdir(templates_dir):
        if template_name.endswith('.docx'):
            template_path = os.path.join(templates_dir, template_name)
            base_name, ext = os.path.splitext(template_name)
            output_filename = f"{base_name}{filename_suffix}{ext}"
            output_path = os.path.join(output_dir, output_filename)
            if fill_template_docxtpl(template_path, output_path, context):
                generated_files.append(output_path)
    return generated_files

def formatar_data_por_extenso(data_str):
    """Formata uma data para o formato por extenso em português."""
    try:
        locale.setlocale(locale.LC_TIME, 'pt_BR.utf8')
        data_obj = datetime.strptime(data_str, '%d/%m/%Y')
        return data_obj.strftime('%d de %B de %Y')
    except (ValueError, locale.Error):
        return data_str

@app.route("/")
@app.route("/dashboard")
def dashboard():
    """Rota para o painel de controle."""
    enviados_hoje, enviados_mes = count_documents()
    enviados_7d = count_documents_last_7_days()
    return render_template("dashboard.html", 
                           enviados_hoje=enviados_hoje, 
                           enviados_mes=enviados_mes,
                           enviados_7d=enviados_7d)

@app.route("/form")
def form():
    """Rota para o formulário de geração de documentos."""
    return render_template("form.html")

@app.route("/generate", methods=["POST"])
def generate():
    """Rota para processar o formulário e gerar os documentos."""
    form_fields = ["name","cargo","cpf","rg","orgao","mes","empresa","setor","salario",
                   "estadocivil","nacionalidade","endereco","cnpj","horario","utiliza", "data_contratacao"]
    data = {f: request.form.get(f,"").strip() for f in form_fields}

    if not data["name"]:
        flash("O campo Nome é obrigatório.", "error")
        return redirect(url_for("form"))

    current_date = datetime.now().strftime("%d/%m/%Y")
    data_formatada = formatar_data_por_extenso(data.get("data_contratacao", ""))

    utiliza_val = data["utiliza"].lower()
    utiliza = "X" if utiliza_val == "sim" else " "
    nutiliza = "X" if utiliza_val != "sim" else " "

    context = {
        "name_id": data["name"],
        "cargo_id": data["cargo"],
        "cpf_id": data["cpf"],
        "rg_id": data["rg"],
        "orgao_id": data["orgao"],
        "mes_id": data["mes"],
        "empresa_id": data["empresa"],
        "setor_id": data["setor"],
        "salario_id": data["salario"],
        "estadocivil_id": data["estadocivil"],
        "nacionalidade_id": data["nacionalidade"],
        "endereco_id": data["endereco"],
        "cnpj_id": data["cnpj"],
        "horario_id": data["horario"],
        "date_id": current_date,
        "data_contratacao_id": data_formatada,
        "utiliza_id": utiliza,
        "nutiliza_id": nutiliza,
    }

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir = Path(OUTPUT_DIR) / f"{timestamp}_{sanitize_filename(data['name'])}"

    generated_files = fill_all_templates_docxtpl(TEMPLATES_DIR, str(run_dir), context,
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

@app.route("/logout")
def logout():
    """Rota para sair da sessão."""
    session.clear()
    flash("Você saiu com sucesso.", "success")
    return redirect(url_for("dashboard"))

if __name__ == "__main__":
    if not os.path.exists(LOG_FILE):
        open(LOG_FILE, 'a').close()
    Path(TEMPLATES_DIR).mkdir(parents=True, exist_ok=True)
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    
    app.run(debug=True)