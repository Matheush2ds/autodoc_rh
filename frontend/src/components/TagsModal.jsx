import React, { useState } from 'react';
import { Check, Copy, Tags } from 'lucide-react';
import { Button, Modal, cn } from '../lib/ui';

const GROUPS = [
  {
    title: 'Dados pessoais',
    tags: [
      ['{{ name_id }}', 'Nome completo do colaborador'],
      ['{{ cpf_id }}', 'CPF formatado'],
      ['{{ rg_id }}', 'Número do RG'],
      ['{{ orgao_id }}', 'Órgão emissor do RG'],
      ['{{ estadocivil_id }}', 'Estado civil'],
      ['{{ nacionalidade_id }}', 'Nacionalidade'],
      ['{{ endereco_id }}', 'Endereço completo'],
    ],
  },
  {
    title: 'Contrato e empresa',
    tags: [
      ['{{ cargo_id }}', 'Cargo / função'],
      ['{{ setor_id }}', 'Setor de alocação'],
      ['{{ salario_id }}', 'Salário numérico (R$ 2.500,00)'],
      ['{{ salarioextenso_id }}', 'Salário por extenso — automático'],
      ['{{ empresa_id }}', 'Razão social da empresa'],
      ['{{ cnpj_id }}', 'CNPJ da empresa — automático'],
      ['{{ horario_id }}', 'Jornada e horário de trabalho'],
      ['{{ date_id }}', 'Data de admissão por extenso'],
      ['{{ datetoday_id }}', 'Data de hoje por extenso'],
    ],
  },
  {
    title: 'Campos específicos',
    tags: [
      ['{{ cnh_id }}', 'Número da CNH (motoristas)'],
      ['{{ categoria_id }}', 'Categoria da CNH (motoristas)'],
      ['{{ utiliza_id }}', '"X" se vai usar o transporte da empresa'],
      ['{{ nutiliza_id }}', '"X" se NÃO vai usar o transporte da empresa'],
    ],
  },
];

export default function TagsModal({ open, onClose }) {
  const [copied, setCopied] = useState(null);

  const copy = async (tag) => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopied(tag);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard bloqueado: o usuário ainda pode selecionar e copiar */
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      icon={Tags}
      title="Tags para os templates Word"
      subtitle="Clique em qualquer tag para copiar e colar no seu arquivo .docx"
      footer={
        <>
          <span className="mr-auto text-[11px] text-muted">
            Templates em <code className="font-mono text-ink">docx_templates/</code>
          </span>
          <Button variant="primary" onClick={onClose}>Fechar</Button>
        </>
      }
    >
      <div className="px-6 py-5 space-y-6">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted mb-2.5">
              {group.title}
            </h4>
            <div className="space-y-1.5">
              {group.tags.map(([tag, desc], i) => (
                <button
                  key={tag}
                  onClick={() => copy(tag)}
                  style={{ '--i': i }}
                  className="group w-full flex items-center justify-between gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-2.5 text-left hover:border-accent hover:tint-accent-soft transition-[border-color,background-color] duration-[120ms] animate-fade-up stagger"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <code className="shrink-0 rounded-lg border border-line bg-surface-2 px-2 py-1 font-mono text-[11px] font-bold text-accent">
                      {tag}
                    </code>
                    <span className="truncate text-[12px] font-medium text-muted">{desc}</span>
                  </div>
                  <span className="shrink-0">
                    {copied === tag ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ok animate-pop-in">
                        <Check className="w-3.5 h-3.5" /> Copiado
                      </span>
                    ) : (
                      <Copy className={cn('w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-[120ms]')} />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
