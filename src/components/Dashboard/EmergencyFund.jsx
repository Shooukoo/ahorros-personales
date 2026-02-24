/* src/components/Dashboard/EmergencyFund.jsx */
import { useApp } from '../../context/AppContext';
import { getEmergencyFund, getMonthlySavings, formatCurrency } from '../../utils/finance';

export function EmergencyFund() {
  const { state } = useApp();
  const { transactions, settings } = state;
  const months  = settings.emergencyFundMonths ?? 3;
  const target  = getEmergencyFund(transactions, months);
  const savings = getMonthlySavings(transactions);
  const monthsNeeded = savings > 0 ? Math.ceil(target / savings) : null;

  if (target === 0) {
    return (
      <div className="rounded-xl border border-[#1c1c1c] bg-[#0e0e0e] p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a] mb-1">
          Fondo de Emergencia
        </p>
        <p className="text-[#5a5a5a] text-xs">
          Agrega gastos fijos para calcular tu fondo recomendado.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#0e0e0e] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a]">
          Fondo de Emergencia
        </p>
        <span className="text-[10px] text-[#5a5a5a] bg-[#141414] border border-[#1c1c1c] px-2 py-0.5 rounded-full">
          {months} meses
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-bold text-[#f2f2f2]">{formatCurrency(target)}</p>
          <p className="text-[11px] text-[#5a5a5a] mt-0.5">Meta recomendada</p>
        </div>
        {monthsNeeded !== null ? (
          <div className="text-right">
            <p className="text-base font-bold text-[#d97706]">{monthsNeeded} meses</p>
            <p className="text-[11px] text-[#5a5a5a]">para lograrlo</p>
          </div>
        ) : (
          <p className="text-xs text-[#ef4444]">Ahorro insuficiente</p>
        )}
      </div>

      <div className="rounded-full bg-[#1c1c1c] h-1 overflow-hidden">
        <div
          className="h-1 rounded-full bg-[#d97706] transition-all"
          style={{ width: monthsNeeded ? `${Math.min(100, (1 / monthsNeeded) * 100)}%` : '0%' }}
        />
      </div>
    </div>
  );
}
