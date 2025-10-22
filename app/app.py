import os
import shutil
import zipfile
import sqlite3
import io 
import csv
from datetime import datetime, date, timedelta
from pathlib import Path
from flask import Flask, render_template, request, send_from_directory, redirect, url_for, flash, session, Response
from werkzeug.utils import secure_filename
from docxtpl import DocxTemplate

# --- NOVAS IMPORTAÇÕES PARA O PDF ---
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
# --- FIM DAS NOVAS IMPORTAÇÕES ---

# --- Importa as configurações ---
from config import settings

app = Flask(__name__)
app.secret_key = settings.SECRET_KEY


# --- Lógica do Banco de Dados ---
# (Sem alterações de get_db até get_all_history_for_export)

def get_db():
    db = sqlite3.connect(settings.DB_FILE)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    db = get_db()
    try:
        with app.open_resource('schema.sql', mode='r') as f:
            db.executescript(f.read())
        print("Banco de dados inicializado com schema.sql.")
    except FileNotFoundError:
        print("schema.sql não encontrado, migrate_db() cuidará da criação da tabela.")
    finally:
        db.close()

def migrate_db():
    db = get_db()
    try:
        cursor = db.execute("PRAGMA table_info(documents)")
        columns = [col['name'] for col in cursor.fetchall()]
        if not columns:
            print("Tabela 'documents' não encontrada. Criando...")
            with app.open_resource('schema.sql', mode='r') as f:
                 db.executescript(f.read())
            print("Tabela 'documents' criada com sucesso.")
            return
        if 'employee_type' not in columns:
            print("Executando migração: Adicionando coluna 'employee_type'...")
            db.execute("ALTER TABLE documents ADD COLUMN employee_type TEXT NOT NULL DEFAULT 'regular'")
            db.commit()
            print("Migração 'employee_type' concluída.")
        if 'zip_filename' not in columns:
            print("Executando migração: Adicionando coluna 'zip_filename'...")
            db.execute("ALTER TABLE documents ADD COLUMN zip_filename TEXT NOT NULL DEFAULT ''")
            db.commit()
            print("Migração 'zip_filename' concluída.")
    except sqlite3.OperationalError:
        print("Erro operacional durante a migração.")
    except FileNotFoundError:
         print("ERRO: schema.sql não encontrado para criar a tabela inicial.")
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

def get_all_history_for_export():
    db = get_db()
    query = "SELECT id, generated_at as gen_datetime, employee_name, company_name, employee_type, zip_filename FROM documents WHERE zip_filename != '' ORDER BY id ASC"
    results = db.execute(query).fetchall()
    db.close()
    return [dict(row) for row in results]


# --- NOVA FUNÇÃO PARA GERAR O PDF ---
def generate_pdf_report(data):
    """Cria um PDF em memória com o histórico de documentos."""
    
    # 1. Configura o buffer e o documento
    buffer = io.BytesIO()
    # Usa 'landscape' (paisagem) para caber mais colunas
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), rightMargin=inch/2, leftMargin=inch/2, topMargin=inch/2, bottomMargin=inch/2)
    elements = []
    styles = getSampleStyleSheet()

    # 2. Adiciona um Título
    title_str = f"Relatório de Documentos Gerados - {date.today().strftime('%d/%m/%Y')}"
    title = Paragraph(title_str, styles['h1'])
    elements.append(title)

    # 3. Prepara os dados da tabela
    # Cabeçalhos
    table_data = [
        ["Data/Hora", "Nome Funcionário", "Empresa", "Tipo Contrato"]
    ]
    # Define a largura das colunas (total de ~10.5 polegadas no A4 paisagem)
    col_widths = [2.5*inch, 3*inch, 3.5*inch, 1.5*inch] 

    for doc in data:
        table_data.append([
            doc['gen_datetime'].split('.')[0], # Remove milissegundos
            doc['employee_name'],
            doc['company_name'],
            doc['employee_type'].capitalize()
        ])

    # 4. Cria o objeto Tabela e aplica o Estilo
    t = Table(table_data, colWidths=col_widths)
    style = TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F7F7F7')), # Fundo cinza claro
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('FONTSIZE', (0,1), (-1,-1), 9),
    ])
    t.setStyle(style)
    elements.append(t)
    
    # 5. Constrói (desenha) o PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer


# --- Rotas da Aplicação ---

@app.route("/")
@app.route("/dashboard")
def dashboard():
    enviados_hoje, enviados_mes = count_documents()
    enviados_7d = count_documents_last_7_days()
    company_data = get_documents_by_company()
    type_data = get_documents_by_type()
    history_data = get_history(20)
    total_gerado = get_total_documents()
    daily_activity_data = get_daily_activity(days=7)
    
    return render_template("dashboard.html", 
                           enviados_hoje=enviados_hoje, 
                           enviados_mes=enviados_mes,
                           enviados_7d=enviados_7d,
                           total_gerado=total_gerado,
                           company_data=company_data,
                           type_data=type_data,
                           daily_activity_data=daily_activity_data,
                           history_data=history_data,
                           current_year=datetime.now().year,
                           app_title=settings.APP_TITLE)

# (Rotas de formulário não mudam)
@app.route("/form/regular")
def form_regular():
    return render_template("form.html", current_year=datetime.now().year, page_title="Funcionário Regular", employee_type="regular", app_title=settings.APP_TITLE)
@app.route("/form/motorista")
def form_motorista():
    return render_template("form.html", current_year=datetime.now().year, page_title="Motorista", employee_type="motorista", app_title=settings.APP_TITLE)
@app.route("/form/aprendiz")
def form_aprendiz():
    return render_template("form.html", current_year=datetime.now().year, page_title="Menor Aprendiz", employee_type="aprendiz", app_title=settings.APP_TITLE)

# (Rota /generate não muda)
@app.route("/generate", methods=["POST"])
def generate():
    form_fields = ["name", "cargo", "cpf", "rg", "orgao", "mes", "empresa", "setor", "salario", "estadocivil", "nacionalidade", "endereco", "cnpj", "horario", "utiliza", "data_contratacao"]
    data = {f: request.form.get(f, "").strip() for f in form_fields}
    employee_type = request.form.get("employee_type", "regular")

    if not data["name"] or not data.get("data_contratacao"):
        flash("Os campos Nome e Data de Contratação são obrigatórios.", "error")
        return redirect(url_for(f"form_{employee_type}"))

    data_contratacao_formatada = formatar_data_por_extenso(data["data_contratacao"])
    datetoday_formatada = formatar_data_por_extenso(datetime.now().strftime("%Y-%m-%d"))

    context = { "name_id": data["name"], "cargo_id": data["cargo"], "cpf_id": data["cpf"], "rg_id": data["rg"], "orgao_id": data["orgao"], "mes_id": data["mes"], "empresa_id": data["empresa"], "setor_id": data["setor"], "salario_id": data["salario"], "estadocivil_id": data["estadocivil"], "nacionalidade_id": data["nacionalidade"], "endereco_id": data["endereco"], "cnpj_id": data["cnpj"], "horario_id": data["horario"], "date_id": data_contratacao_formatada, "data_contratacao_id": data_contratacao_formatada, "datetoday_id": datetoday_formatada, "utiliza_id": "X" if data["utiliza"].lower() == "sim" else " ", "nutiliza_id": "X" if data["utiliza"].lower() != "sim" else " ", }

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    sanitized_name = sanitize_filename(data['name'])
    run_dir = Path(settings.OUTPUT_DIR) / f"{timestamp}_{sanitized_name}"
    
    current_template_dir = os.path.join(settings.TEMPLATES_DIR, employee_type)
    if not os.path.exists(current_template_dir):
        current_template_dir = settings.TEMPLATES_DIR

    generated_files = fill_all_templates_docxtpl(current_template_dir, str(run_dir), context, f"_{sanitized_name}")

    if not generated_files:
        flash(f"Nenhum modelo .docx encontrado em '{current_template_dir}'.", "error")
        return redirect(url_for(f"form_{employee_type}"))

    zip_name = f"docs_{sanitized_name}_{timestamp}.zip"
    zip_path = Path(settings.OUTPUT_DIR) / zip_name
    
    with zipfile.ZipFile(zip_path, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for f in generated_files:
            zf.write(f, arcname=Path(f).name)

    shutil.rmtree(run_dir)
    log_document(data["name"], data["empresa"], employee_type, zip_name) 
    return send_from_directory(settings.OUTPUT_DIR, zip_name, as_attachment=True)


# (Rota /download_zip não muda)
@app.route("/download_zip/<path:filename>")
def download_zip(filename):
    safe_filename = secure_filename(filename)
    if safe_filename != filename:
        flash("Tentativa de acesso a arquivo inválido.", "error")
        return redirect(url_for("dashboard"))
    file_path = Path(settings.OUTPUT_DIR) / safe_filename
    if not file_path.is_file():
        flash("Arquivo não encontrado no servidor. Pode ter sido excluído.", "error")
        return redirect(url_for("dashboard"))
    return send_from_directory(settings.OUTPUT_DIR, safe_filename, as_attachment=True)


# (Rota /download_history_csv não muda)
@app.route("/download_history_csv")
def download_history_csv():
    all_docs = get_all_history_for_export()
    if not all_docs:
        flash("Nenhum histórico para exportar.", "info")
        return redirect(url_for("dashboard"))
        
    mem_file = io.StringIO()
    fieldnames = ['Data', 'Nome Funcionario', 'Empresa', 'Tipo Contrato']
    writer = csv.DictWriter(mem_file, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    for doc in all_docs:
        writer.writerow({
            'Data': doc['gen_datetime'],
            'Nome Funcionario': doc['employee_name'],
            'Empresa': doc['company_name'],
            'Tipo Contrato': doc['employee_type'].capitalize()
        })
    mem_file.seek(0)
    filename = f"historico_documentos_rh_{date.today().strftime('%Y-%m-%d')}.csv"
    return Response(
        mem_file,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename={filename}"}
    )


# --- NOVA ROTA DE DOWNLOAD (PDF) ---
@app.route("/download_history_pdf")
def download_history_pdf():
    """Gera e envia um arquivo PDF de todo o histórico de documentos."""
    
    # 1. Busca todos os dados do banco
    all_docs = get_all_history_for_export()
    
    if not all_docs:
        flash("Nenhum histórico para exportar.", "info")
        return redirect(url_for("dashboard"))
        
    # 2. Gera o PDF em memória
    pdf_buffer = generate_pdf_report(all_docs)
    
    # 3. Prepara a Resposta do Flask
    filename = f"historico_documentos_rh_{date.today().strftime('%Y-%m-%d')}.pdf"
    
    return Response(
        pdf_buffer,
        mimetype='application/pdf',
        headers={"Content-Disposition": f"attachment;filename={filename}"}
    )


# (Rota /logout não muda)
@app.route("/logout")
def logout():
    session.clear()
    flash("Você saiu com sucesso.", "success")
    return redirect(url_for("dashboard"))

# (Bloco __main__ não muda)
if __name__ == "__main__":
    with app.app_context():
        Path(settings.TEMPLATES_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.OUTPUT_DIR).mkdir(parents=True, exist_ok=True) 
        if not os.path.exists(settings.DB_FILE):
            print("Criando banco de dados...")
            init_db()
        print("Verificando migrações do banco de dados...")
        migrate_db() 
    app.run(debug=True, host="0.0.0.0")