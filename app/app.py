import os
import shutil
import zipfile
import sqlite3
import io 
import csv
from datetime import datetime, date, timedelta
from pathlib import Path
from flask import Flask, send_from_directory, request, jsonify, send_file, Response
from flask_cors import CORS
from werkzeug.utils import secure_filename
from docxtpl import DocxTemplate
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from num2words import num2words

# Importação das configurações
from config import settings 

app = Flask(__name__, static_folder=settings.STATIC_FOLDER, static_url_path='/')
app.secret_key = settings.SECRET_KEY
CORS(app)

# --- Banco de Dados ---

def get_db():
    db = sqlite3.connect(settings.DB_FILE)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    db = get_db()
    try:
        with app.open_resource('schema.sql', mode='r') as f:
            db.executescript(f.read())
        print("Banco de dados inicializado.")
    except Exception as e:
        print(f"Erro ao inicializar DB: {e}")
    finally:
        db.close()

def migrate_db():
    db = get_db()
    try:
        cursor = db.execute("PRAGMA table_info(documents)")
        columns = [col['name'] for col in cursor.fetchall()]
        if not columns:
            with app.open_resource('schema.sql', mode='r') as f:
                 db.executescript(f.read())
            return
        if 'employee_type' not in columns:
            db.execute("ALTER TABLE documents ADD COLUMN employee_type TEXT NOT NULL DEFAULT 'regular'")
            db.commit()
        if 'zip_filename' not in columns:
            db.execute("ALTER TABLE documents ADD COLUMN zip_filename TEXT NOT NULL DEFAULT ''")
            db.commit()
    except Exception as e:
        print(f"Erro na migração: {e}")
    finally:
        db.close()

def log_document(name, empresa, employee_type, zip_filename):
    db = get_db()
    db.execute(
        "INSERT INTO documents (generated_at, employee_name, company_name, employee_type, zip_filename) VALUES (?, ?, ?, ?, ?)",
        (datetime.now(), name, empresa, employee_type, zip_filename)
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

def get_total_documents():
    db = get_db()
    count = db.execute("SELECT COUNT(id) FROM documents").fetchone()[0]
    db.close()
    return count

def get_documents_by_company():
    db = get_db()
    query = "SELECT company_name, COUNT(id) as count FROM documents GROUP BY company_name ORDER BY count DESC"
    results = db.execute(query).fetchall()
    db.close()
    return [dict(row) for row in results]

def get_documents_by_type():
    db = get_db()
    query = "SELECT employee_type, COUNT(id) as count FROM documents GROUP BY employee_type"
    results = db.execute(query).fetchall()
    db.close()
    return {row['employee_type']: row['count'] for row in results}

def get_daily_activity(days=7):
    db = get_db()
    today = date.today()
    date_counts = {(today - timedelta(days=i)).strftime('%d/%m'): 0 for i in range(days - 1, -1, -1)}
    start_date_str = (today - timedelta(days=days - 1)).strftime('%Y-%m-%d')
    query = "SELECT STRFTIME('%d/%m', generated_at) as gen_date, COUNT(id) as count FROM documents WHERE DATE(generated_at) >= ? GROUP BY gen_date"
    results = db.execute(query, (start_date_str,)).fetchall()
    db.close()
    for row in results:
        if row['gen_date'] in date_counts:
            date_counts[row['gen_date']] = row['count']
    return {'labels': list(date_counts.keys()), 'data': list(date_counts.values())}

def get_history(limit=20):
    db = get_db()
    query = "SELECT id, STRFTIME('%d/%m/%Y %H:%M', generated_at) as gen_date, employee_name, company_name, employee_type, zip_filename FROM documents WHERE zip_filename != '' ORDER BY id DESC LIMIT ?"
    results = db.execute(query, (limit,)).fetchall()
    db.close()
    return [dict(row) for row in results]

# --- Funções Auxiliares de Documento ---

def sanitize_filename(name):
    return secure_filename(name.replace(" ", "_"))

def fill_template_docxtpl(template_path, output_path, context):
    doc = DocxTemplate(template_path)
    doc.render(context)
    doc.save(output_path)
    return True

def fill_all_templates_docxtpl(templates_dir, output_dir, context, filename_suffix=""):
    generated_files = []
    failed_files = [] 
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    if not os.path.exists(templates_dir):
        return [], []

    for template_name in os.listdir(templates_dir):
        if template_name.endswith('.docx') and not template_name.startswith('~'):
            template_path = os.path.join(templates_dir, template_name)
            base_name, ext = os.path.splitext(template_name)
            output_filename = f"{base_name}{filename_suffix}{ext}"
            output_path = os.path.join(output_dir, output_filename)
            
            try:
                if fill_template_docxtpl(template_path, output_path, context):
                    generated_files.append(output_path)
            except Exception as e:
                print(f"Erro no template {template_name}: {e}")
                failed_files.append(template_name)

    return generated_files, failed_files

def formatar_data_por_extenso(data_str):
    try:
        meses_em_portugues = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
        data_obj = datetime.strptime(data_str, '%Y-%m-%d')
        dia, mes_numero, ano = data_obj.day, data_obj.month, data_obj.year
        nome_do_mes = meses_em_portugues[mes_numero - 1]
        return f'{dia:02d} de {nome_do_mes} de {ano}'
    except:
        return data_str

def formatar_salario_por_extenso(salario_str):
    if not salario_str: return "Zero reais"
    cleaned_str = salario_str.replace("R$", "").replace(".", "").replace(",", ".").strip()
    try:
        valor_float = float(cleaned_str)
    except ValueError:
        return "(Salário inválido)"
    reais = int(valor_float)
    centavos = int(round((valor_float - reais) * 100))
    if reais == 0: reais_txt = "zero"
    else: reais_txt = num2words(reais, lang='pt_BR')
    sufixo_real = "reais" if reais != 1 else "real"
    if centavos == 0:
        centavos_txt = ""
    else:
        centavos_txt = num2words(centavos, lang='pt_BR')
        sufixo_centavo = "centavos" if centavos != 1 else "centavo"
        centavos_txt = f" e {centavos_txt} {sufixo_centavo}"
    return f"{reais_txt} {sufixo_real}{centavos_txt}"

# --- Rotas da Aplicação (API) ---

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route("/api/dashboard-data")
def api_dashboard():
    hoje, mes = count_documents()
    last_7 = count_documents_last_7_days()
    total = get_total_documents()
    return jsonify({
        "stats": {
            "today": hoje,
            "week": last_7,
            "month": mes,
            "total": total
        },
        "charts": {
            "daily": get_daily_activity(days=7),
            "companies": get_documents_by_company(),
            "types": get_documents_by_type()
        },
        "history": get_history(20)
    })

@app.route("/api/generate", methods=["POST"])
def api_generate():
    try:
        data = request.form.to_dict()
        employee_type = data.get("employee_type", "regular")

        if not data.get("name") or not data.get("data_contratacao"):
            return jsonify({"error": "Campos obrigatórios faltando"}), 400

        data_contratacao_formatada = formatar_data_por_extenso(data["data_contratacao"])
        datetoday_formatada = formatar_data_por_extenso(datetime.now().strftime("%Y-%m-%d"))
        
        context = {
            "name_id": data.get("name"), 
            "cargo_id": data.get("cargo"), 
            "cpf_id": data.get("cpf"),
            "rg_id": data.get("rg"), 
            "orgao_id": data.get("orgao"), 
            "mes_id": data.get("mes"),
            "empresa_id": data.get("empresa"), 
            "setor_id": data.get("setor"), 
            "salario_id": data.get("salario"),
            "salarioextenso_id": formatar_salario_por_extenso(data.get("salario")),
            "cnh_id": data.get("cnh"), 
            "categoria_id": data.get("categoria"),
            "estadocivil_id": data.get("estadocivil"), 
            "nacionalidade_id": data.get("nacionalidade"),
            "endereco_id": data.get("endereco"), 
            "cnpj_id": data.get("cnpj"), 
            "horario_id": data.get("horario"),
            "date_id": data_contratacao_formatada, 
            "data_contratacao_id": data_contratacao_formatada,
            "datetoday_id": datetoday_formatada,
            "utiliza_id": "X" if data.get("utiliza", "").lower() == "sim" else " ",
            "nutiliza_id": "X" if data.get("utiliza", "").lower() != "sim" else " "
        }

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        sanitized_name = sanitize_filename(data['name'])
        
        # Garante que a pasta de saída existe
        if not os.path.exists(settings.OUTPUT_DIR):
            os.makedirs(settings.OUTPUT_DIR)

        # Pasta temporária para esta geração
        run_dir = Path(settings.OUTPUT_DIR) / f"{timestamp}_{sanitized_name}"
        
        folder_name_map = {'regular': 'regular', 'motorista': 'motorista', 'aprendiz': 'menor_aprendiz'}
        current_template_dir = os.path.join(settings.TEMPLATES_DIR, folder_name_map.get(employee_type, 'regular'))
        
        generated_files, failed_files = fill_all_templates_docxtpl(
            current_template_dir, str(run_dir), context, f"_{sanitized_name}"
        )
        
        if not generated_files:
            return jsonify({"error": "Nenhum documento gerado"}), 500

        zip_name = f"docs_{sanitized_name}_{timestamp}.zip"
        zip_path = Path(settings.OUTPUT_DIR) / zip_name
        
        with zipfile.ZipFile(zip_path, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
            for f in generated_files:
                zf.write(f, arcname=Path(f).name)

        if os.path.exists(run_dir):
            shutil.rmtree(run_dir)
        
        # Loga no banco e garante que o zip_name está correto para download
        log_document(data["name"], data["empresa"], employee_type, zip_name)
        
        print(f"Sucesso! Arquivo gerado em: {zip_path}")
        return send_file(zip_path, as_attachment=True, download_name=zip_name)

    except Exception as e:
        print(f"ERRO API: {e}")
        if 'run_dir' in locals() and os.path.exists(run_dir):
            shutil.rmtree(run_dir)
        return jsonify({"error": str(e)}), 500

@app.route("/download_zip/<path:filename>")
def download_zip(filename):
    # Segurança para evitar paths maliciosos
    safe_filename = secure_filename(filename)
    
    # Caminho completo do arquivo dentro do container
    file_path = os.path.join(settings.OUTPUT_DIR, safe_filename)
    
    # Verifica se o arquivo REALMENTE existe no disco antes de tentar enviar
    if not os.path.exists(file_path):
        print(f"ERRO DE DOWNLOAD: Arquivo não encontrado no caminho físico: {file_path}")
        return jsonify({"error": "Arquivo físico não encontrado. Ele pode ter sido excluído do servidor."}), 404
        
    return send_from_directory(settings.OUTPUT_DIR, safe_filename, as_attachment=True)

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    # Garante que as pastas essenciais existam ao iniciar
    if not os.path.exists(settings.OUTPUT_DIR):
        os.makedirs(settings.OUTPUT_DIR)
        
    if not os.path.exists(settings.DB_FILE):
        init_db()
    migrate_db()
    
    app.run(host="0.0.0.0", port=5000)