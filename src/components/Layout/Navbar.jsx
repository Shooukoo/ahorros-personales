/* src/components/Layout/Navbar.jsx */
import { useState } from 'react';
import { sileo } from 'sileo';
import { useApp } from '../../context/AppContext';
import { exportData } from '../../services/storage';
import { ImportModal } from '../Import/ImportModal';

const TABS = [
  { id: 'dashboard',    label: 'Dashboard' },
  { id: 'transactions', label: 'Transacciones', tourAttr: 'nav-transactions' },
  { id: 'goals',        label: 'Metas',         tourAttr: 'nav-goals' },
  { id: 'simulator',   label: 'Simulador',      tourAttr: 'nav-simulator' },
];

export function Navbar({ activeTab, onTabChange }) {
  const { state } = useApp();
  const [importOpen, setImportOpen] = useState(false);

  function handleExport() {
    exportData(state);
    sileo.success({ title: 'Datos exportados', description: 'El archivo JSON fue descargado.' });
  }

  const tabCls = (active) => [
    'px-1 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
    // Garantiza min 44px de alto para touch targets (py-3 = 12px × 2 + texto ≈ 44px)
    active
      ? 'border-[#7c3aed] text-[#f2f2f2]'
      : 'border-transparent text-[#5a5a5a] hover:text-[#a0a0a0]',
  ].join(' ');

  // Touch target: min-h-[44px] garantiza botones accesibles en móvil
  const actionBtnCls = [
    'px-3 min-h-[44px] rounded-lg text-xs font-semibold transition-all',
    'bg-[#0e0e0e] border border-[#1c1c1c] text-[#a0a0a0]',
    'hover:border-[#2a2a2a] hover:text-[#f2f2f2]',
  ].join(' ');

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#1c1c1c]" style={{ background: '#080808' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top row */}
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <a href="https://uningenieromas.vercel.app" className="text-xl font-bold tracking-tight select-none"
              style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
              <span style={{ color: '#a78bfa' }}>.</span>
              <span className="text-[#f2f2f2]">uningenieromás</span>
            </a>

            {/* Actions — min-h-[44px] para touch target */}
            <div className="flex items-center gap-2">
              <button onClick={handleExport} className={actionBtnCls}>
                Exportar
              </button>
              <button
                onClick={() => setImportOpen(true)}
                className="px-3 min-h-[44px] rounded-lg text-xs font-semibold transition-all bg-[#1a0e2e] border border-[#7c3aed]/40 text-[#a78bfa] hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed]"
              >
                Importar
              </button>
            </div>
          </div>

          {/* Tab bar — scroll-touch para iOS smooth scrolling, oculta scrollbar */}
          <nav className="flex gap-6 overflow-x-auto scroll-touch">
          {TABS.map(({ id, label, tourAttr }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={tabCls(activeTab === id)}
                {...(tourAttr ? { 'data-tour': tourAttr } : {})}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <ImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
