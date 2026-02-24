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

const VIEWS = {
  dashboard:    <DashboardView />,
  transactions: <TransactionList />,
  goals:        <GoalsList />,
  simulator:    <CompoundInterest />,
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AppProvider>
      <Toaster position="top-right" theme="dark" />
      <div className="min-h-screen flex flex-col">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
          {VIEWS[activeTab] ?? VIEWS.dashboard}
        </main>

        <Footer onTabChange={setActiveTab} />
      </div>
    </AppProvider>
  );
}

export default App;
