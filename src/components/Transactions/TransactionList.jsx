/* src/components/Transactions/TransactionList.jsx */
import { useState } from 'react';
import { sileo } from 'sileo';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/finance';
import { TransactionForm } from './TransactionForm';

const TYPE_COLOR = { income: '#22c55e', expense: '#ef4444' };
const TYPE_LABEL = { income: 'Ingreso', expense: 'Gasto' };
const RECURRENCE = { fixed: 'Fijo', variable: 'Variable' };

export function TransactionList() {
  const { state, deleteTransaction } = useApp();
  const { transactions } = state;

  const [formOpen,    setFormOpen]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [filter,      setFilter]      = useState('all');
  const [search,      setSearch]      = useState('');

  const filtered = transactions
    .filter((t) => filter === 'all' || t.type === filter)
    .filter((t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function openEdit(txn) { setEditTarget(txn); setFormOpen(true); }
  function openNew()      { setEditTarget(null); setFormOpen(true); }

  function handleDelete(id, name) {
    const tid = sileo.action({
      title: 'Eliminar transacción',
      description: `¿Eliminar "${name}"? Esta acción no se puede deshacer.`,
      button: {
        title: 'Eliminar',
        onClick: () => {
          deleteTransaction(id);
          sileo.dismiss(tid);
          sileo.success({ title: 'Eliminado', description: `"${name}" fue eliminado.` });
        },
      },
    });
  }

  const filterBtnCls = (active) =>
    `px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
      active ? 'bg-[#1c1c1c] text-[#f2f2f2]' : 'text-[#5a5a5a] hover:text-[#a0a0a0]'
    }`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#f2f2f2] tracking-tight">Transacciones</h2>
        <button onClick={openNew}
          className="self-start sm:self-auto px-4 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold transition-all active:scale-95">
          + Nueva
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="text" placeholder="Buscar…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-[#0e0e0e] border border-[#1c1c1c] text-[#f2f2f2] text-sm placeholder-[#5a5a5a] focus:outline-none focus:border-[#7c3aed] transition-colors"
        />
        <div className="flex gap-1 p-1 rounded-lg bg-[#0e0e0e] border border-[#1c1c1c]">
          {[['all','Todos'],['income','Ingresos'],['expense','Gastos']].map(([val,label]) => (
            <button key={val} onClick={() => setFilter(val)} className={filterBtnCls(filter === val)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[#5a5a5a] text-sm">Sin transacciones.</p>
          <button onClick={openNew} className="mt-2 text-[#7c3aed] hover:underline text-sm">
            Agregar una →
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((txn) => (
            <div key={txn.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0e0e0e] border border-[#1c1c1c] hover:border-[#2a2a2a] transition-colors group">
              {/* Indicador + info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ background: TYPE_COLOR[txn.type] }} />
                <div className="min-w-0">
                  <p className="text-[#f2f2f2] text-sm font-medium truncate">{txn.name}</p>
                  <p className="text-[#5a5a5a] text-xs mt-0.5">
                    {txn.category} · {RECURRENCE[txn.recurrence]}
                  </p>
                </div>
              </div>

              {/* Monto + acciones */}
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className="font-bold text-sm tabular-nums"
                  style={{ color: TYPE_COLOR[txn.type] }}>
                  {txn.type === 'income' ? '+' : '−'}{formatCurrency(txn.amount)}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(txn)}
                    className="px-2 py-1 rounded-md text-[#5a5a5a] hover:text-[#f2f2f2] hover:bg-[#1c1c1c] text-xs transition-all">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(txn.id, txn.name)}
                    className="px-2 py-1 rounded-md text-[#5a5a5a] hover:text-[#ef4444] hover:bg-[#1a0808] text-xs transition-all">
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TransactionForm isOpen={formOpen} onClose={() => setFormOpen(false)} editTarget={editTarget} />
    </div>
  );
}
