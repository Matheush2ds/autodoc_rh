CREATE TABLE IF NOT EXISTS documents (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    generated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    employee_name TEXT NOT NULL,
    company_name  TEXT NOT NULL,
    employee_type TEXT NOT NULL DEFAULT 'regular',
    zip_filename  TEXT NOT NULL DEFAULT ''
);