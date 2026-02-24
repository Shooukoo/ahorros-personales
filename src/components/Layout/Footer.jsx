/* src/components/Layout/Footer.jsx */
export function Footer({ onTabChange }) {
  const year = new Date().getFullYear();

  const NAV = [
    { id: 'dashboard',    label: 'Dashboard' },
    { id: 'transactions', label: 'Transacciones' },
    { id: 'goals',        label: 'Metas' },
    { id: 'simulator',    label: 'Simulador' },
  ];

  return (
    <footer className="border-t border-[#1c1c1c] mt-12" style={{ background: '#080808' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="mb-3">
              <a href="#" className="text-2xl font-bold tracking-tight select-none"
                style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
                <span style={{ color: '#a78bfa' }}>.</span>
                <span className="text-[#f2f2f2]">Ahorros</span>
              </a>
            </div>
            <p className="text-[#5a5a5a] text-sm leading-relaxed">
              Gestiona tus finanzas personales de forma privada.<br />
              Todos tus datos se guardan en tu dispositivo.
            </p>
          </div>

          {/* Secciones */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a] mb-4">
              Secciones
            </h4>
            <ul className="space-y-2">
              {NAV.map(({ id, label }) => (
                <li key={id}>
                  <button
                    onClick={() => onTabChange?.(id)}
                    className="text-sm text-[#5a5a5a] hover:text-[#a78bfa] transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a] mb-4">
              Privacidad
            </h4>
            <ul className="space-y-2 text-sm text-[#5a5a5a] leading-relaxed">
              <li>Sin cuentas, sin servidores.</li>
              <li>Datos guardados en LocalStorage.</li>
              <li>Exporta e importa tu respaldo en JSON.</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1c1c1c] pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#3a3a3a]">
          <span>© {year} Ahorros. App local-first.</span>
          <span style={{ color: '#7c3aed', opacity: 0.5 }}>local-first · privacy by default</span>
        </div>
      </div>
    </footer>
  );
}
