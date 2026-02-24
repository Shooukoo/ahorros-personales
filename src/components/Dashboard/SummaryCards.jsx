/* src/components/Dashboard/SummaryCards.jsx */
import { useApp } from '../../context/AppContext';
import {
  getTotalIncome,
  getTotalExpenses,
  getMonthlySavings,
  formatCurrency,
} from '../../utils/finance';

const CARD_STYLES = {
  neutral:  { outer: 'border-[#1c1c1c] bg-[#0e0e0e]',   label: '#5a5a5a', value: '#f2f2f2' },
  positive: { outer: 'border-[#14352a] bg-[#071a14]',    label: '#22c55e', value: '#22c55e' },
  negative: { outer: 'border-[#3a1414] bg-[#1a0808]',    label: '#ef4444', value: '#ef4444' },
};

function StatCard({ label, value, subtext, variant = 'neutral' }) {
  const s = CARD_STYLES[variant];
  return (
    <div className={`rounded-xl border p-4 ${s.outer} transition-all hover:brightness-110`}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: s.label }}>
        {label}
      </p>
      <p className="text-2xl font-bold leading-none" style={{ color: s.value }}>
        {value}
      </p>
      {subtext && (
        <p className="text-[11px] mt-2" style={{ color: '#5a5a5a' }}>
          {subtext}
        </p>
      )}
    </div>
  );
}

export function SummaryCards() {
  const { state } = useApp();
  const income   = getTotalIncome(state.transactions);
  const expenses = getTotalExpenses(state.transactions);
  const savings  = getMonthlySavings(state.transactions);
  const rate     = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatCard
        label="Ingresos"
        value={formatCurrency(income)}
        subtext="Este mes"
        variant="neutral"
      />
      <StatCard
        label="Gastos"
        value={formatCurrency(expenses)}
        subtext={income > 0 ? `${((expenses / income) * 100).toFixed(1)}% del ingreso` : undefined}
        variant="neutral"
      />
      <StatCard
        label="Capacidad de ahorro"
        value={formatCurrency(savings)}
        subtext={income > 0 ? `Tasa ${rate}%` : 'Agrega ingresos'}
        variant={savings > 0 ? 'positive' : savings < 0 ? 'negative' : 'neutral'}
      />
    </div>
  );
}
