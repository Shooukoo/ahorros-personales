/* src/views/DashboardView.jsx */
import { useState } from 'react';
import { SummaryCards } from '../components/Dashboard/SummaryCards';
import { ExpenseChart } from '../components/Dashboard/ExpenseChart';
import { EmergencyFund } from '../components/Dashboard/EmergencyFund';
import { TransactionForm } from '../components/Transactions/TransactionForm';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthlySavings, getMonthsToGoal } from '../utils/finance';

function MiniGoals({ goals, savings }) {
  if (!goals.length) return null;
  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#0e0e0e] p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a]">Metas</p>
      <div className="space-y-2.5">
        {goals.slice(0, 3).map((goal) => {
          const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const remaining = goal.targetAmount - goal.currentAmount;
          const months = remaining > 0 ? getMonthsToGoal(remaining, savings) : 0;
          return (
            <div key={goal.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#a0a0a0] truncate pr-2">{goal.name}</span>
                <span className="text-[#5a5a5a] flex-shrink-0">
                  {pct >= 100 ? 'Completada' : months ? `${months}m` : '—'}
                </span>
              </div>
              <div className="w-full bg-[#1c1c1c] rounded-full h-1 overflow-hidden">
                <div className="h-1 rounded-full transition-all bg-[#7c3aed]"
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardView() {
  const { state } = useApp();
  const { transactions, goals } = state;
  const savings = getMonthlySavings(transactions);
  const [formOpen, setFormOpen] = useState(false);

  const lastFive = [...transactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const TYPE_COLOR = { income: '#22c55e', expense: '#ef4444' };

  return (
    <div className="space-y-4">
      {/* Tarjetas */}
      <SummaryCards />

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico */}
        <div className="lg:col-span-2 rounded-xl border border-[#1c1c1c] bg-[#0e0e0e] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a] mb-3">
            Distribución de Gastos
          </p>
          <ExpenseChart />
        </div>

        {/* Panel lateral */}
        <div className="space-y-3">
          <EmergencyFund />
          <MiniGoals goals={goals} savings={savings} />
        </div>
      </div>

      {/* Últimas transacciones */}
      <div className="rounded-xl border border-[#1c1c1c] bg-[#0e0e0e] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a]">
            Últimas transacciones
          </p>
          <button onClick={() => setFormOpen(true)}
            className="px-3 py-1 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold transition-all active:scale-95">
            + Agregar
          </button>
        </div>

        {lastFive.length === 0 ? (
          <p className="text-[#5a5a5a] text-sm py-4 text-center">
            Sin transacciones.{' '}
            <button onClick={() => setFormOpen(true)} className="text-[#7c3aed] hover:underline">
              Agrega una →
            </button>
          </p>
        ) : (
          <div className="space-y-1">
            {lastFive.map((t) => (
              <div key={t.id}
                className="flex items-center justify-between py-2 border-b border-[#0e0e0e] last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-1 h-6 rounded-full flex-shrink-0"
                    style={{ background: TYPE_COLOR[t.type] }} />
                  <div className="min-w-0">
                    <p className="text-[#f2f2f2] text-sm truncate leading-tight">{t.name}</p>
                    <p className="text-[#5a5a5a] text-xs">{t.category}</p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums flex-shrink-0 ml-3"
                  style={{ color: TYPE_COLOR[t.type] }}>
                  {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <TransactionForm isOpen={formOpen} onClose={() => setFormOpen(false)} editTarget={null} />
    </div>
  );
}
