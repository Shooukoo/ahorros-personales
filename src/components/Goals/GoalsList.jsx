/* src/components/Goals/GoalsList.jsx */
import { useState } from 'react';
import { sileo } from 'sileo';
import { useApp } from '../../context/AppContext';
import { getMonthlySavings, getMonthsToGoal, formatCurrency } from '../../utils/finance';
import { GoalForm } from './GoalForm';
import { Modal } from '../UI/Modal';

// ── Modal de depósito ──────────────────────────────────────────────
function DepositModal({ goal, isOpen, onClose, onDeposit }) {
  const [amount, setAmount] = useState('');
  const [error, setError]   = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) return setError('Ingresa un monto válido.');
    const remaining = goal.targetAmount - goal.currentAmount;
    if (val > remaining)
      return setError(`Máximo: ${formatCurrency(remaining)}`);
    onDeposit(val);
    setAmount('');
    onClose();
  }

  function handleClose() { setAmount(''); setError(''); onClose(); }

  if (!goal) return null;
  const remaining = goal.targetAmount - goal.currentAmount;
  const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const futureAmt = parseFloat(amount) || 0;
  const futurePct = Math.min(100, ((goal.currentAmount + futureAmt) / goal.targetAmount) * 100);

  const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm bg-[#141414] border border-[#2a2a2a] text-[#f2f2f2] placeholder-[#5a5a5a] focus:outline-none focus:border-[#7c3aed] transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Depósito">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resumen de meta */}
        <div className="p-3 rounded-xl bg-[#141414] border border-[#1c1c1c] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#f2f2f2] font-medium">{goal.name}</span>
            <span className="text-[#5a5a5a]">{pct.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-[11px] text-[#5a5a5a]">
            <span>Ahorrado: {formatCurrency(goal.currentAmount)}</span>
            <span>Restante: {formatCurrency(remaining)}</span>
          </div>
          <div className="rounded-full bg-[#1c1c1c] h-1 overflow-hidden">
            <div className="h-1 rounded-full bg-[#7c3aed] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Input del monto */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a] mb-1.5">
            Monto a depositar (MXN)
          </label>
          <input autoFocus type="number" min="0.01" step="0.01" placeholder="0.00"
            value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
          <p className="text-[11px] text-[#5a5a5a] mt-1">Máximo: {formatCurrency(remaining)}</p>
        </div>

        {/* Preview */}
        {futureAmt > 0 && (
          <div className="p-3 rounded-xl bg-[#071a14] border border-[#14352a]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#22c55e] mb-1">
              Nuevo total
            </p>
            <p className="text-xl font-bold text-[#22c55e]">
              {formatCurrency(goal.currentAmount + futureAmt)}
            </p>
            <div className="rounded-full bg-[#1c1c1c] h-1 mt-2 overflow-hidden">
              <div className="h-1 rounded-full bg-[#22c55e] transition-all" style={{ width: `${futurePct}%` }} />
            </div>
            <p className="text-[11px] text-[#5a5a5a] mt-1">{futurePct.toFixed(1)}% completado</p>
          </div>
        )}

        {error && (
          <p className="text-xs text-[#ef4444] bg-[#1a0808] border border-[#3a1414] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit"
          className="w-full py-2.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-semibold transition-all active:scale-95">
          Confirmar depósito
        </button>
      </form>
    </Modal>
  );
}

// ── Barra de progreso ──────────────────────────────────────────────
function Bar({ percent, color = '#7c3aed' }) {
  const pct = Math.min(100, Math.max(0, percent));
  return (
    <div className="w-full bg-[#1c1c1c] rounded-full h-1 overflow-hidden">
      <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ── Tarjeta de meta ────────────────────────────────────────────────
function GoalCard({ goal, savings, onEdit, onDelete, onDeposit }) {
  const pct       = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const remaining = goal.targetAmount - goal.currentAmount;
  const monthsLeft = remaining > 0 ? getMonthsToGoal(remaining, savings) : 0;
  const done = pct >= 100;

  const barColor = done ? '#22c55e' : pct >= 60 ? '#2563eb' : pct >= 30 ? '#d97706' : '#7c3aed';

  return (
    <div className="p-4 bg-[#0e0e0e] border border-[#1c1c1c] rounded-xl hover:border-[#2a2a2a] transition-colors group space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#f2f2f2] font-semibold text-sm">{goal.name}</p>
          <p className="text-[#5a5a5a] text-xs mt-0.5">
            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(goal)}
            className="px-2 py-1 rounded-md text-[#5a5a5a] hover:text-[#f2f2f2] hover:bg-[#1c1c1c] text-xs transition-all">
            Editar
          </button>
          <button onClick={() => onDelete(goal.id, goal.name)}
            className="px-2 py-1 rounded-md text-[#5a5a5a] hover:text-[#ef4444] hover:bg-[#1a0808] text-xs transition-all">
            Borrar
          </button>
        </div>
      </div>

      {/* Barra */}
      <div className="space-y-1.5">
        <Bar percent={pct} color={barColor} />
        <div className="flex justify-between text-[11px] text-[#5a5a5a]">
          <span>{pct.toFixed(1)}%</span>
          <span>{formatCurrency(remaining)} restante</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#141414]">
        {done ? (
          <span className="text-xs font-semibold text-[#22c55e]">Meta alcanzada</span>
        ) : (
          <span className="text-[11px] text-[#5a5a5a]">
            {savings <= 0 ? 'Ahorro insuficiente'
              : monthsLeft ? `~${monthsLeft} ${monthsLeft === 1 ? 'mes' : 'meses'}`
              : '—'}
          </span>
        )}
        {!done && (
          <button onClick={() => onDeposit(goal)}
            className="px-3 py-1 rounded-lg bg-[#1a0e2e] hover:bg-[#7c3aed] border border-[#7c3aed]/40 hover:border-[#7c3aed] text-[#a78bfa] hover:text-white text-xs font-semibold transition-all">
            Depositar
          </button>
        )}
      </div>
    </div>
  );
}

// ── Vista principal ────────────────────────────────────────────────
export function GoalsList() {
  const { state, deleteGoal, editGoal } = useApp();
  const { goals, transactions } = state;
  const savings = getMonthlySavings(transactions);

  const [formOpen,    setFormOpen]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [depositGoal, setDepositGoal] = useState(null);

  function openEdit(g)   { setEditTarget(g); setFormOpen(true); }
  function openNew()      { setEditTarget(null); setFormOpen(true); }

  function handleDelete(id, name) {
    const tid = sileo.action({
      title: 'Eliminar meta',
      description: `¿Eliminar "${name}"?`,
      button: {
        title: 'Eliminar',
        onClick: () => {
          deleteGoal(id);
          sileo.dismiss(tid);
          sileo.success({ title: 'Meta eliminada', description: `"${name}" fue eliminada.` });
        },
      },
    });
  }

  function handleDeposit(amount) {
    if (!depositGoal) return;
    editGoal(depositGoal.id, {
      currentAmount: Math.min(depositGoal.targetAmount, depositGoal.currentAmount + amount),
    });
    sileo.success({ title: 'Depósito registrado', description: `+${formatCurrency(amount)} a "${depositGoal.name}".` });
    setDepositGoal(null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#f2f2f2]">Metas de Ahorro</h2>
        <button onClick={openNew}
          className="px-4 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold transition-all active:scale-95">
          + Nueva
        </button>
      </div>

      {/* Capacidad de ahorro */}
      <div className="px-4 py-3 rounded-xl bg-[#0e0e0e] border border-[#1c1c1c] flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a]">Ahorro mensual</p>
        <p className={`font-bold text-sm ${savings >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
          {formatCurrency(savings)}
        </p>
      </div>

      {goals.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[#5a5a5a] text-sm">Sin metas de ahorro.</p>
          <button onClick={openNew} className="mt-2 text-[#7c3aed] hover:underline text-sm">
            Crear la primera →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} savings={savings}
              onEdit={openEdit} onDelete={handleDelete} onDeposit={setDepositGoal} />
          ))}
        </div>
      )}

      <GoalForm isOpen={formOpen} onClose={() => setFormOpen(false)} editTarget={editTarget} />
      <DepositModal goal={depositGoal} isOpen={!!depositGoal}
        onClose={() => setDepositGoal(null)} onDeposit={handleDeposit} />
    </div>
  );
}
