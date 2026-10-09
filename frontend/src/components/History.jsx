import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FileText, Layers } from 'lucide-react';

import Toolbar from './Toolbar';
import { HistoryTable } from './Dashboard';
import { Button, Card, CATEGORIES, Chip, EmptyState, ErrorState, Skeleton, cn } from '../lib/ui';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'regular', label: CATEGORIES.regular.short },
  { id: 'motorista', label: CATEGORIES.motorista.short },
  { id: 'aprendiz', label: CATEGORIES.aprendiz.short },
];

export default function History({ query, onNavigate, onOpenMobileNav }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [updatedAt, setUpdatedAt] = useState(new Date());

  const load = () => {
    setError(null);
    axios
      .get('/api/dashboard-data')
      .then(({ data }) => {
        setRows(data.history || []);
        setUpdatedAt(new Date());
      })
      .catch(() => setError('Não consegui carregar o histórico de kits agora.'));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesFilter = filter === 'all' || r.employee_type === filter;
      const matchesQuery =
        !q ||
        r.employee_name.toLowerCase().includes(q) ||
        r.company_name.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [rows, query, filter]);

  const toolbar = (
    <Toolbar
      title="Histórico de kits"
      updatedAt={updatedAt}
      onRefresh={load}
      onOpenMobileNav={onOpenMobileNav}
      actions={
        <Button icon={FileText} onClick={() => onNavigate('form:regular')}>
          Novo kit
        </Button>
      }
    />
  );

  if (error) {
    return (<>{toolbar}<ErrorState message={error} onRetry={load} /></>);
  }

  if (!rows) {
    return (
      <>
        {toolbar}
        <div className="p-4 sm:p-6"><Skeleton className="h-[420px] rounded-[20px]" /></div>
      </>
    );
  }

  return (
    <>
      {toolbar}
      <div className="p-4 sm:p-6 pb-12 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'h-8 px-3.5 rounded-full border text-[11px] font-bold transition-[background-color,border-color,color,transform] duration-[120ms] active:scale-95',
                filter === f.id
                  ? 'bg-navy-950 text-white border-navy-950 dark:bg-gold-400 dark:text-navy-950 dark:border-gold-400'
                  : 'bg-surface text-muted border-line hover:text-ink hover:border-sand-300 dark:hover:border-navy-600'
              )}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto">
            <Chip tone="neutral">
              {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
            </Chip>
          </span>
        </div>

        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Layers}
              title={query || filter !== 'all' ? 'Nada encontrado' : 'Nenhum kit gerado ainda'}
              description={
                query || filter !== 'all'
                  ? 'Tente outro termo de busca ou remova o filtro de categoria.'
                  : 'Os documentos que você emitir aparecem aqui, com link para baixar de novo.'
              }
            />
          ) : (
            <HistoryTable rows={filtered} />
          )}
        </Card>
      </div>
    </>
  );
}
