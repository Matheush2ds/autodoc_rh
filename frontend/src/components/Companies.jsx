import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';

import Toolbar from './Toolbar';
import {
  Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, Modal, Skeleton,
  Toast, useFeedback,
} from '../lib/ui';

const maskCNPJ = (v) =>
  v
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);

const EMPTY = { open: false, isEdit: false, id: null, name: '', cnpj: '' };

export default function Companies({ query, onOpenMobileNav }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, showFeedback] = useFeedback();
  const [updatedAt, setUpdatedAt] = useState(new Date());

  const load = () => {
    setError(null);
    axios
      .get('/api/companies')
      .then(({ data }) => {
        setRows(data || []);
        setUpdatedAt(new Date());
      })
      .catch(() => setError('Não consegui carregar a lista de empresas agora.'));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) => c.name.toLowerCase().includes(q) || c.cnpj.includes(q));
  }, [rows, query]);

  const save = async (e) => {
    e.preventDefault();
    if (!modal.name.trim() || !modal.cnpj.trim()) {
      showFeedback('error', 'Razão social e CNPJ são obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: modal.name.trim(), cnpj: modal.cnpj.trim() };
      if (modal.isEdit) {
        await axios.put(`/api/companies/${modal.id}`, payload);
        showFeedback('success', 'Empresa atualizada.');
      } else {
        await axios.post('/api/companies', payload);
        showFeedback('success', 'Empresa cadastrada.');
      }
      setModal(EMPTY);
      load();
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Erro ao salvar a empresa.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await axios.delete(`/api/companies/${confirm.id}`);
      showFeedback('success', 'Empresa removida.');
      setConfirm(null);
      load();
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Erro ao excluir a empresa.');
    } finally {
      setSaving(false);
    }
  };

  const toolbar = (
    <Toolbar
      title="Empresas"
      updatedAt={updatedAt}
      onRefresh={load}
      onOpenMobileNav={onOpenMobileNav}
      actions={
        <Button icon={Plus} onClick={() => setModal({ ...EMPTY, open: true })}>
          Nova empresa
        </Button>
      }
    />
  );

  if (error) return (<>{toolbar}<ErrorState message={error} onRetry={load} /></>);

  return (
    <>
      {toolbar}

      <div className="p-4 sm:p-6 pb-12">
        <Card className="overflow-hidden">
          {!rows ? (
            <div className="p-5 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-[14px]" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={query ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
              description={
                query
                  ? 'Tente outro termo — a busca considera razão social e CNPJ.'
                  : 'Cadastre as empresas do grupo para que o CNPJ seja preenchido automaticamente nos contratos.'
              }
              action={
                !query && (
                  <Button icon={Plus} onClick={() => setModal({ ...EMPTY, open: true })}>
                    Cadastrar empresa
                  </Button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto scroll-slim">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-2">
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted">Razão social</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted">CNPJ</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted whitespace-nowrap">Cadastrada em</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => (
                    <tr
                      key={c.id}
                      style={{ '--i': Math.min(idx, 9) }}
                      className="group border-b border-line last:border-0 transition-[background-color,transform] duration-[120ms] hover:bg-surface-2 hover:translate-x-0.5 animate-fade-up stagger"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-[12px] tint-accent text-accent flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </span>
                          <span className="text-[13px] font-bold text-ink truncate max-w-[520px]">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[12px] font-semibold text-muted whitespace-nowrap">{c.cnpj}</td>
                      <td className="px-5 py-3.5 text-[12px] text-muted whitespace-nowrap tnum">{c.created_at || '—'}</td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-0 max-md:opacity-100 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-[120ms]">
                          <button
                            onClick={() => setModal({ open: true, isEdit: true, id: c.id, name: c.name, cnpj: c.cnpj })}
                            aria-label={`Editar ${c.name}`}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-accent hover:tint-accent"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirm(c)}
                            aria-label={`Excluir ${c.name}`}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-fail hover:bg-fail/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal(EMPTY)}
        icon={Building2}
        title={modal.isEdit ? 'Editar empresa' : 'Nova empresa'}
        subtitle="O CNPJ é inserido automaticamente nos contratos gerados."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(EMPTY)}>Cancelar</Button>
            <Button loading={saving} onClick={save}>
              {modal.isEdit ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
          </>
        }
      >
        <form onSubmit={save} className="px-6 py-5 space-y-4">
          <Field
            label="Razão social"
            value={modal.name}
            onChange={(e) => setModal((m) => ({ ...m, name: e.target.value.toUpperCase() }))}
            placeholder="EX: EMPRESA EXEMPLO LTDA"
            className="uppercase"
            autoFocus
          />
          <Field
            label="CNPJ"
            value={modal.cnpj}
            onChange={(e) => setModal((m) => ({ ...m, cnpj: maskCNPJ(e.target.value) }))}
            placeholder="00.000.000/0000-00"
            className="font-mono"
            maxLength={18}
          />
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        loading={saving}
        title="Excluir empresa"
        message="Essa empresa deixa de aparecer na seleção do formulário. Os kits já emitidos continuam no histórico."
        highlight={confirm?.name}
      />

      <Toast feedback={feedback} />
    </>
  );
}
