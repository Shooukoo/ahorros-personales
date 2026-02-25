// src/App.jsx
import { useState } from 'react';
import './App.css';
import 'sileo/styles.css';
import { Toaster } from 'sileo';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Layout/Navbar';
import { DashboardView } from './views/DashboardView';
import { TransactionList } from './components/Transactions/TransactionList';
import { GoalsList } from './components/Goals/GoalsList';
import { CompoundInterest } from './components/Simulator/CompoundInterest';
import { Footer } from './components/Layout/Footer';
import { useTour } from './hooks/useTour';

const VIEWS = {
  dashboard:    <DashboardView />,
  transactions: <TransactionList />,
  goals:        <GoalsList />,
  simulator:    <CompoundInterest />,
};

function TourBanner({ onStart }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #1a0e2e 0%, #0e0e0e 100%)',
      borderBottom: '1px solid #2a1f4a',
      fontFamily: 'Outfit, Inter, sans-serif',
    }}>
      {/* Mismo ancho/padding que el main content */}
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '7px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        {/* Sparkle icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#a78bfa" style={{ flexShrink: 0 }}>
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
        </svg>

        <span style={{ fontSize: '13px', color: '#a0a0a0', flex: 1 }}>
          ¿Necesitas un tour?
        </span>

        <button
          onClick={onStart}
          style={{
            flexShrink: 0,
            padding: '3px 14px',
            borderRadius: '999px',
            background: '#7c3aed',
            border: 'none',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#6d28d9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#7c3aed'; }}
        >
          Sí, muéstrame →
        </button>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { startTour } = useTour(setActiveTab);

  return (
    <AppProvider>
      <Toaster position="top-right" theme="dark" />
      <div className="min-h-screen flex flex-col">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Banner del tour — solo en el dashboard */}
        {activeTab === 'dashboard' && <TourBanner onStart={startTour} />}

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
          {VIEWS[activeTab] ?? VIEWS.dashboard}
        </main>

        <Footer onTabChange={setActiveTab} />
      </div>
    </AppProvider>
  );
}

export default App;
