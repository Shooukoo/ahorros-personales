/* src/components/Dashboard/ExpenseChart.jsx */
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useApp } from '../../context/AppContext';
import { getExpensesByCategory, formatCurrency } from '../../utils/finance';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  '#7c3aed','#2563eb','#0891b2','#059669',
  '#d97706','#dc2626','#db2777','#6366f1','#84cc16','#14b8a6',
];

export function ExpenseChart() {
  const { state } = useApp();
  const byCategory = getExpensesByCategory(state.transactions);
  const labels = Object.keys(byCategory);
  const data   = Object.values(byCategory);
  const total  = data.reduce((a, b) => a + b, 0);

  if (labels.length === 0) {
    return (
      <div className="h-40 flex flex-col items-center justify-center gap-2">
        <p className="text-[#5a5a5a] text-sm">Sin datos de gastos</p>
      </div>
    );
  }

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: PALETTE.slice(0, labels.length),
      borderColor: '#0e0e0e',
      borderWidth: 3,
      hoverOffset: 6,
    }],
  };

  const options = {
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#a0a0a0',
          padding: 16,
          font: { size: 11, family: 'Inter' },
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ` ${ctx.label}: ${formatCurrency(ctx.parsed)} (${((ctx.parsed / total) * 100).toFixed(1)}%)`,
        },
        bodyFont: { family: 'Inter' },
        titleFont: { family: 'Inter' },
      },
    },
  };

  return (
    <div className="max-h-64 flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
