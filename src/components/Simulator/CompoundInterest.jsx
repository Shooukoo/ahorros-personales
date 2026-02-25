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
import { useWindowSize } from '../../hooks/useWindowSize';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const inputCls = [
  'w-full px-3 py-2.5 rounded-lg text-sm',
  'bg-[#141414] border border-[#2a2a2a] text-[#f2f2f2]',
  'focus:outline-none focus:border-[#7c3aed] transition-colors',
].join(' ');

const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a] mb-1.5';
const hintCls  = 'text-[11px] text-[#3a3a3a] mt-1';

export function CompoundInterest() {
  const { state } = useApp();
  const { width } = useWindowSize();
  const isMobile = width < 480;
  const defaultSavings = Math.max(0, getMonthlySavings(state.transactions));

  const [pmt,    setPmt]    = useState(String(Math.round(defaultSavings)));
  const [rate,   setRate]   = useState(String(state.settings?.monthlyInterestRate ?? 11));
  const [months, setMonths] = useState('24');

  const { labels, withInterest, withoutInterest } = useMemo(() => {
    const m = parseInt(months) || 0;
    const r = parseFloat(rate)  || 0;
    const p = parseFloat(pmt)   || 0;

    const labels        = Array.from({ length: m + 1 }, (_, i) => `Mes ${i}`);
    const withInterest  = labels.map((_, i) => +(getFutureValue(p, r, i).toFixed(2)));
    const withoutInterest = labels.map((_, i) => +(p * i).toFixed(2));

    return { labels, withInterest, withoutInterest };
  }, [pmt, rate, months]);

  const fv   = withInterest[withInterest.length - 1]    || 0;
  const base = withoutInterest[withoutInterest.length - 1] || 0;
  const gain = fv - base;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Con interés compuesto',
        data: withInterest,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.06)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Sin rendimiento',
        data: withoutInterest,
        borderColor: '#2a2a2a',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
        borderDash: [5, 4],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#5a5a5a',
          font: { family: 'Inter', size: 11 },
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
        },
      },
      tooltip: {
        bodyFont: { family: 'Inter' },
        titleFont: { family: 'Inter' },
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#3a3a3a', font: { size: 10 }, maxTicksLimit: 10 },
        grid:  { color: '#141414' },
        border: { color: '#1c1c1c' },
      },
      y: {
        ticks: {
          color: '#3a3a3a',
          font: { size: 10 },
          callback: (v) => formatCurrency(v),
        },
        grid:   { color: '#141414' },
        border: { color: '#1c1c1c' },
      },
    },
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#f2f2f2] tracking-tight">
          Simulador de Interés Compuesto
        </h2>
        <p className="text-[#5a5a5a] text-xs mt-1 font-mono">
          FV = PMT × [((1 + r)ⁿ − 1) / r]
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Ahorro mensual (PMT)</label>
          <input className={inputCls} type="number" min="0"
            value={pmt} onChange={(e) => setPmt(e.target.value)} />
          <p className={hintCls}>Calculado: {formatCurrency(defaultSavings)}</p>
        </div>
        <div>
          <label className={labelCls}>Tasa anual (%)</label>
          <input className={inputCls} type="number" min="0" step="0.1"
            value={rate} onChange={(e) => setRate(e.target.value)} />
          <p className={hintCls}>Referencia CETES: ~11%</p>
        </div>
        <div>
          <label className={labelCls}>Horizonte (meses)</label>
          <input className={inputCls} type="number" min="1" max="360"
            value={months} onChange={(e) => setMonths(e.target.value)} />
          <p className={hintCls}>≈ {(parseInt(months) / 12).toFixed(1)} años</p>
        </div>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Sin rendimiento */}
        <div className="rounded-xl border border-[#1c1c1c] bg-[#0e0e0e] p-4">
          <p className={labelCls}>Sin rendimiento</p>
          <p className="text-[#f2f2f2] text-xl font-bold">{formatCurrency(base)}</p>
        </div>
        {/* Con interés */}
        <div className="rounded-xl border border-[#14352a] bg-[#071a14] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#22c55e] mb-1.5">
            Valor futuro con interés
          </p>
          <p className="text-[#22c55e] text-xl font-bold">{formatCurrency(fv)}</p>
        </div>
        {/* Ganancia */}
        <div className="rounded-xl border border-[#1a1a3e] bg-[#0a0a1f] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#818cf8] mb-1.5">
            Ganancia por interés
          </p>
          <p className="text-[#818cf8] text-xl font-bold">+{formatCurrency(gain)}</p>
        </div>
      </div>

      {/* Gráfico — omitido en móvil (<480px) para no cargar Chart.js canvas pesado */}
      {isMobile ? (
        <div className="rounded-xl border border-[#1c1c1c] bg-[#0e0e0e] p-5 text-center">
          <p className="text-[#5a5a5a] text-xs">
            Girá el dispositivo o abrí desde una pantalla más grande para ver la gráfica.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#1c1c1c] bg-[#0e0e0e] p-4">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
