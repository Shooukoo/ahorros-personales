/* src/components/Layout/Navbar.jsx */
import { useState, useEffect } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // El tour lo abre en móvil antes de destacar los botones de navegación
  useEffect(() => {
    const handler = () => setMenuOpen(true);
    window.addEventListener('tour:open-menu', handler);
    return () => window.removeEventListener('tour:open-menu', handler);
  }, []);

  function handleExport() {
    exportData(state);
    sileo.success({ title: 'Datos exportados', description: 'El archivo JSON fue descargado.' });
  }

  function handleTab(id) {
    onTabChange(id);
    setMenuOpen(false);
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(8,8,8,0.92)' : '#080808',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: '1px solid #1c1c1c',
        }}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between"
          aria-label="Navegación principal"
        >
          {/* Logo */}
          <a
            href="https://uningenieromas.vercel.app"
            className="text-xl font-bold tracking-tight select-none shrink-0"
            style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
            aria-label=".uningenieromás — Inicio"
          >
            <span style={{ color: '#a78bfa' }}>.</span>
            <span style={{ color: '#f2f2f2' }}>uningenieromás</span>
          </a>

          {/* Desktop tabs — centro */}
          <ul className="hidden md:flex items-center gap-6" role="list">
            {TABS.map(({ id, label, tourAttr }) => {
              const active = activeTab === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => handleTab(id)}
                    className="relative text-sm font-medium transition-colors duration-200 group py-1"
                    style={{ color: active ? '#f2f2f2' : '#6b7280' }}
                    {...(tourAttr ? { 'data-tour': tourAttr } : {})}
                  >
                    {label}
                    {/* Subrayado animado */}
                    <span
                      className="absolute -bottom-0.5 left-0 h-px transition-all duration-300"
                      style={{
                        background: '#7c3aed',
                        width: active ? '100%' : '0%',
                      }}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 h-9 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: '#0e0e0e',
                border: '1px solid #1c1c1c',
                color: '#a0a0a0',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f2f2f2'; e.currentTarget.style.borderColor = '#2a2a2a'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#a0a0a0'; e.currentTarget.style.borderColor = '#1c1c1c'; }}
            >
              Exportar
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="px-3 h-9 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: '#1a0e2e',
                border: '1px solid rgba(124,58,237,0.4)',
                color: '#a78bfa',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1a0e2e'; e.currentTarget.style.color = '#a78bfa'; }}
            >
              Importar
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors"
            style={{ color: '#6b7280' }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f2f2f2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280'; }}
          >
            {menuOpen ? (
              /* X icon */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              /* Hamburger icon */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden px-4 pb-4 pt-1 flex flex-col gap-1"
            style={{
              borderTop: '1px solid #1c1c1c',
              background: 'rgba(8,8,8,0.97)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {TABS.map(({ id, label, tourAttr }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => handleTab(id)}
                  className="text-left text-sm font-medium py-2.5 px-3 rounded-lg transition-colors"
                  style={{
                    color: active ? '#f2f2f2' : '#6b7280',
                    background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                    borderLeft: active ? '2px solid #7c3aed' : '2px solid transparent',
                  }}
                  {...(tourAttr ? { 'data-tour': tourAttr } : {})}
                >
                  {label}
                </button>
              );
            })}

            {/* Actions móvil */}
            <div className="flex gap-2 mt-2 pt-2" style={{ borderTop: '1px solid #1c1c1c' }}>
              <button
                onClick={() => { handleExport(); setMenuOpen(false); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: '#0e0e0e', border: '1px solid #1c1c1c', color: '#a0a0a0' }}
              >
                Exportar
              </button>
              <button
                onClick={() => { setImportOpen(true); setMenuOpen(false); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: '#1a0e2e', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa' }}
              >
                Importar
              </button>
            </div>
          </div>
        )}
      </header>

      <ImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
