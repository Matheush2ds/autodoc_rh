import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Trash2, UserPlus, Users as UsersIcon } from 'lucide-react';

import Toolbar from './Toolbar';
import {
  Button, Card, Chip, ConfirmDialog, EmptyState, ErrorState, Field, Modal,
  SelectField, Skeleton, Toast, useFeedback,
} from '../lib/ui';

const EMPTY = { open: false, name: '', username: '', password: '', confirmPassword: '', role: 'admin' };

export default function Users({ query, currentUser, onOpenMobileNav }) {
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
      .get('/api/users')
      .then(({ data }) => {
        setRows(data || []);
        setUpdatedAt(new Date());
      })
      .catch(() => setError('Não consegui carregar a lista de usuários agora.'));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  }, [rows, query]);

  const save = async (e) => {
    e.preventDefault();
    if (!modal.name.trim() || !modal.username.trim() || !modal.password) {
      showFeedback('error', 'Preencha nome, usuário e senha.');
      return;
    }
    if (modal.password !== modal.confirmPassword) {
      showFeedback('error', 'As senhas não coincidem.');
      return;
    }
    if (modal.password.length < 4) {
      showFeedback('error', 'A senha precisa de pelo menos 4 caracteres.');
      return;
    }

    setSaving(true);
    try {
      await axios.post('/api/users', {
        name: modal.name.trim(),
        username: modal.username.trim().toLowerCase(),
        password: modal.password,
        role: modal.role,
      });
      showFeedback('success', 'Usuário criado.');
      setModal(EMPTY);
      load();
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Erro ao cadastrar o usuário.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await axios.delete(`/api/users/${confirm.id}`);
      showFeedback('success', 'Usuário excluído.');
      setConfirm(null);
      load();
    } catch (err) {
      showFeedback('error', err.response?.data?.error || 'Erro ao excluir o usuário.');
    } finally {
      setSaving(false);
    }
  };

  const toolbar = (
    <Toolbar
      title="Usuários"
      updatedAt={updatedAt}
      onRefresh={load}
      onOpenMobileNav={onOpenMobileNav}
      actions={
        <Button icon={UserPlus} onClick={() => setModal({ ...EMPTY, open: true })}>
          Novo usuário
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
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-[14px]" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title={query ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
              description={query ? 'Tente outro nome ou login.' : 'Crie os acessos da equipe de RH ao portal.'}
            />
          ) : (
            <div className="overflow-x-auto scroll-slim">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-2">
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted">Colaborador</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted">Login</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted whitespace-nowrap">Nível de acesso</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted whitespace-nowrap">Criado em</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => {
                    const isMe = currentUser?.id === u.id;
                    const onlyOne = rows.length <= 1;
                    return (
                      <tr
                        key={u.id}
                        style={{ '--i': Math.min(idx, 9) }}
                        className="group border-b border-line last:border-0 transition-[background-color,transform] duration-[120ms] hover:bg-surface-2 hover:translate-x-0.5 animate-fade-up stagger"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-[12px] bg-navy-950 dark:bg-navy-800 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                              {u.name.substring(0, 2).toUpperCase()}
                            </span>
                            <span className="text-[13px] font-bold text-ink">{u.name}</span>
                            {isMe && <Chip tone="gold">Você</Chip>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[12px] font-semibold text-muted">@{u.username}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <Chip tone="neutral">
                            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                            {u.role === 'admin' ? 'Administrador' : 'Operador RH'}
                          </Chip>
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-muted whitespace-nowrap tnum">{u.created_at}</td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => setConfirm(u)}
                            disabled={isMe || onlyOne}
                            title={
                              isMe
                                ? 'Você não pode excluir a própria conta enquanto estiver logado'
                                : onlyOne
                                ? 'O sistema precisa de pelo menos um usuário'
                                : `Excluir ${u.username}`
                            }
                            className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-fail hover:bg-fail/10 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-muted disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal(EMPTY)}
        icon={UserPlus}
        title="Novo usuário"
        subtitle="Defina os dados de acesso ao portal."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(EMPTY)}>Cancelar</Button>
            <Button loading={saving} onClick={save}>Cadastrar</Button>
          </>
        }
      >
        <form onSubmit={save} className="px-6 py-5 space-y-4">
          <Field
            label="Nome completo"
            value={modal.name}
            onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))}
            placeholder="Ex: Mariana Silva"
            autoFocus
          />
          <Field
            label="Usuário de login"
            value={modal.username}
            onChange={(e) => setModal((m) => ({ ...m, username: e.target.value.toLowerCase().replace(/\s+/g, '') }))}
            placeholder="Ex: mariana.silva"
            className="font-mono"
            autoComplete="off"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Senha"
              type="password"
              value={modal.password}
              onChange={(e) => setModal((m) => ({ ...m, password: e.target.value }))}
              placeholder="Mín. 4 caracteres"
              autoComplete="new-password"
            />
            <Field
              label="Confirmar senha"
              type="password"
              value={modal.confirmPassword}
              onChange={(e) => setModal((m) => ({ ...m, confirmPassword: e.target.value }))}
              placeholder="Repita a senha"
              autoComplete="new-password"
            />
          </div>
          <SelectField
            label="Nível de acesso"
            value={modal.role}
            onChange={(e) => setModal((m) => ({ ...m, role: e.target.value }))}
          >
            <option value="admin">Administrador — acesso completo</option>
            <option value="operador">Operador RH — geração e métricas</option>
          </SelectField>
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        loading={saving}
        title="Excluir usuário"
        message="Esse acesso ao portal será removido imediatamente."
        highlight={confirm ? `${confirm.name} (@${confirm.username})` : ''}
      />

      <Toast feedback={feedback} />
    </>
  );
}
