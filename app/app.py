import os
import shutil
import zipfile
import locale
import sqlite3
from datetime import datetime, date, timedelta
from io import BytesIO
from pathlib import Path
from flask import Flask, render_template, request, send_from_directory, redirect, url_for, flash, session
from werkzeug.utils import secure_filename
from docxtpl import DocxTemplate

# --- Configurações ---
APP_TITLE = "Autodoc_Rh"
TEMPLATES_DIR = "docx_templates"
OUTPUT_DIR = "generated_docs"
DB_FILE = "log.db"

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'sua-chave-secreta-super-segura-aqui')


# --- Lógica do Banco de Dados ---

def get_db():
    db = sqlite3.connect(DB_FILE)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.executescript(f.read())
    db.close()

def log_document(name, empresa):
    db = get_db()
    db.execute(
        "INSERT INTO documents (generated_at, employee_name, company_name) VALUES (?, ?, ?)",
        (datetime.now(), name, empresa)
    )
    db.commit()
    db.close()

def count_documents():
    db = get_db()
    hoje_str = date.today().strftime('%Y-%m-%d')
    mes_str = date.today().strftime('%Y-%m')
    hoje_count = db.execute("SELECT COUNT(id) FROM documents WHERE DATE(generated_at) = ?", (hoje_str,)).fetchone()[0]
    mes_count = db.execute("SELECT COUNT(id) FROM documents WHERE STRFTIME('%Y-%m', generated_at) = ?", (mes_str,)).fetchone()[0]
    db.close()
    return hoje_count, mes_count

def count_documents_last_7_days():
    db = get_db()
    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')
    count = db.execute("SELECT COUNT(id) FROM documents WHERE generated_at >= ?", (seven_days_ago,)).fetchone()[0]
    db.close()
    return count

def get_documents_by_company():
    db = get_db()
    query = """
        SELECT company_name, COUNT(id) as count
        FROM documents
        GROUP BY company_name
        ORDER BY count DESC
    """
    results = db.execute(query).fetchall()
    db.close()
    return [dict(row) for row in results]


# --- Funções Auxiliares ---
def sanitize_filename(name):
    return secure_filename(name.replace(" ", "_"))

def fill_template_docxtpl(template_path, output_path, context):
    try:
        doc = DocxTemplate(template_path)
        doc.render(context)
        doc.save(output_path)
        return True
    except Exception as e:
        print(f"Erro ao preencher {template_path} com docxtpl: {e}")
        return False

def fill_all_templates_docxtpl(templates_dir, output_dir, context, filename_suffix=""):
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
    try:
        locales_to_try = ['pt_BR.utf8', 'pt-br', 'Portuguese_Brazil.1252']
        for loc in locales_to_try:
            try:
                locale.setlocale(locale.LC_TIME, loc)
                break
            except locale.Error:
                continue
        data_obj = datetime.strptime(data_str, '%Y-%m-%d')
        return data_obj.strftime('%d de %B de %Y')
    except Exception:
        try:
            return datetime.strptime(data_str, '%Y-%m-%d').strftime('%d/%m/%Y')
        except ValueError:
            return data_str


# --- Rotas da Aplicação ---

@app.route("/")
@app.route("/dashboard")
def dashboard():
    enviados_hoje, enviados_mes = count_documents()
    enviados_7d = count_documents_last_7_days()
    company_data = get_documents_by_company()
    
    return render_template("dashboard.html", 
                           enviados_hoje=enviados_hoje, 
                           enviados_mes=enviados_mes,
                           enviados_7d=enviados_7d,
                           company_data=company_data,
                           current_year=datetime.now().year)

@app.route("/form")
def form():
    return render_template("form.html", current_year=datetime.now().year)

@app.route("/generate", methods=["POST"])
def generate():
    form_fields = ["name", "cargo", "cpf", "rg", "orgao", "mes", "empresa", "setor", "salario",
                   "estadocivil", "nacionalidade", "endereco", "cnpj", "horario", "utiliza", "data_contratacao"]
    data = {f: request.form.get(f, "").strip() for f in form_fields}

    if not data["name"] or not data.get("data_contratacao"):
        flash("Os campos Nome e Data de Contratação são obrigatórios.", "error")
        return redirect(url_for("form"))

    data_contratacao_formatada = formatar_data_por_extenso(data["data_contratacao"])
    datetoday_formatada = formatar_data_por_extenso(datetime.now().strftime("%Y-%m-%d"))

    context = {
        "name_id": data["name"], "cargo_id": data["cargo"], "cpf_id": data["cpf"],
        "rg_id": data["rg"], "orgao_id": data["orgao"], "mes_id": data["mes"],
        "empresa_id": data["empresa"], "setor_id": data["setor"], "salario_id": data["salario"],
        "estadocivil_id": data["estadocivil"], "nacionalidade_id": data["nacionalidade"],
        "endereco_id": data["endereco"], "cnpj_id": data["cnpj"], "horario_id": data["horario"],

        "date_id": data_contratacao_formatada,
        "data_contratacao_id": data_contratacao_formatada,
        "datetoday_id": datetoday_formatada,

        "utiliza_id": "X" if data["utiliza"].lower() == "sim" else " ",
        "nutiliza_id": "X" if data["utiliza"].lower() != "sim" else " ",
    }

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    sanitized_name = sanitize_filename(data['name'])
    run_dir = Path(OUTPUT_DIR) / f"{timestamp}_{sanitized_name}"
    
    generated_files = fill_all_templates_docxtpl(TEMPLATES_DIR, str(run_dir), context, f"_{sanitized_name}")

    if not generated_files:
        flash("Nenhum modelo .docx encontrado em 'docx_templates'.", "error")
        return redirect(url_for("form"))

    zip_name = f"docs_{sanitized_name}_{timestamp}.zip"
    zip_path = Path(OUTPUT_DIR) / zip_name
    
    with zipfile.ZipFile(zip_path, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for f in generated_files:
            zf.write(f, arcname=Path(f).name)

    shutil.rmtree(run_dir)
    log_document(data["name"], data["empresa"])
    return redirect(url_for("success", filename=zip_name))

@app.route("/success")
def success():
    filename = request.args.get('filename')
    return render_template("success.html", filename=filename, current_year=datetime.now().year)

@app.route("/download/<path:filename>")
def download(filename):
    return send_from_directory(OUTPUT_DIR, filename, as_attachment=True)

@app.route("/logout")
def logout():
    session.clear()
    flash("Você saiu com sucesso.", "success")
    return redirect(url_for("dashboard"))

if __name__ == "__main__":
    with app.app_context():
        Path(TEMPLATES_DIR).mkdir(parents=True, exist_ok=True)
        Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
        if not os.path.exists(DB_FILE):
            print("Criando banco de dados...")
            init_db()
    
    app.run(debug=True, host="0.0.0.0")
