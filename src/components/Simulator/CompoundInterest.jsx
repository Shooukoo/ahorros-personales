// src/components/Simulator/CompoundInterest.jsx
import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useApp } from '../../context/AppContext';
import { getMonthlySavings, getFutureValue, formatCurrency } from '../../utils/finance';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export function CompoundInterest() {
  const { state } = useApp();
  const defaultSavings = Math.max(0, getMonthlySavings(state.transactions));

  const [pmt,    setPmt]    = useState(String(Math.round(defaultSavings)));
  const [rate,   setRate]   = useState(String(state.settings.monthlyInterestRate ?? 11));
  const [months, setMonths] = useState('24');

  const { data, withInterest, withoutInterest } = useMemo(() => {
    const m  = parseInt(months) || 0;
    const r  = parseFloat(rate) || 0;
    const p  = parseFloat(pmt)  || 0;

    const labels = Array.from({ length: m + 1 }, (_, i) => `Mes ${i}`);

    const withInterest   = labels.map((_, i) => +(getFutureValue(p, r, i).toFixed(2)));
    const withoutInterest = labels.map((_, i) => +(p * i).toFixed(2));

    return { data: labels, withInterest, withoutInterest };
  }, [pmt, rate, months]);

  const gain = withInterest[withInterest.length - 1] - withoutInterest[withoutInterest.length - 1];

  const chartData = {
    labels: data,
    datasets: [
      {
        label: 'Con interés compuesto',
        data: withInterest,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Sin rendimiento',
        data: withoutInterest,
        borderColor: '#64748b',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [6, 3],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 12 },
        grid:  { color: '#1e293b' },
      },
      y: {
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (v) => formatCurrency(v),
        },
        grid: { color: '#1e293b' },
      },
    },
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-green-500 transition-colors';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">📈 Simulador de Interés Compuesto</h2>
        <p className="text-slate-500 text-sm mt-1">
          Fórmula: Valor Futuro de Anualidades — FV = PMT × [((1 + r)ⁿ − 1) / r]
        </p>
      </div>

      {/* Parámetros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Ahorro mensual (PMT)</label>
          <input
            className={inputCls}
            type="number"
            min="0"
            value={pmt}
            onChange={(e) => setPmt(e.target.value)}
          />
          <p className="text-slate-600 text-xs mt-1">
            Calculado: {formatCurrency(defaultSavings)}
          </p>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Tasa anual (%)</label>
          <input
            className={inputCls}
            type="number"
            min="0"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <p className="text-slate-600 text-xs mt-1">Referencia CETES: ~11%</p>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Horizonte (meses)</label>
          <input
            className={inputCls}
            type="number"
            min="1"
            max="360"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          />
          <p className="text-slate-600 text-xs mt-1">≈ {(parseInt(months)/12).toFixed(1)} años</p>
        </div>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
          <p className="text-slate-500 text-xs">Total ahorrado sin rendimiento</p>
          <p className="text-white text-xl font-bold mt-1">
            {formatCurrency(withoutInterest[withoutInterest.length - 1] || 0)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-green-950 border border-green-800">
          <p className="text-slate-400 text-xs">Valor futuro con interés</p>
          <p className="text-green-400 text-xl font-bold mt-1">
            {formatCurrency(withInterest[withInterest.length - 1] || 0)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-950 border border-blue-800">
          <p className="text-slate-400 text-xs">Ganancia por interés compuesto</p>
          <p className="text-blue-400 text-xl font-bold mt-1">
            +{formatCurrency(gain || 0)}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-4 bg-slate-800 border border-slate-700 rounded-2xl">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
