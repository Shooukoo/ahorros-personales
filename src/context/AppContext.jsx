// src/context/AppContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { loadState, saveState } from '../services/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(() => loadState());

  /**
   * Actualiza una sección del estado y persiste automáticamente en LocalStorage.
   * @param {Partial<AppState>} patch
   */
  const updateState = useCallback((patch) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }, []);

  // ── Transacciones ────────────────────────────────────────────────────────
  const addTransaction = useCallback((txn) => {
    updateState({ transactions: [...state.transactions, txn] });
  }, [state.transactions, updateState]);

  const editTransaction = useCallback((id, updates) => {
    updateState({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    });
  }, [state.transactions, updateState]);

  const deleteTransaction = useCallback((id) => {
    updateState({
      transactions: state.transactions.filter((t) => t.id !== id),
    });
  }, [state.transactions, updateState]);

  // ── Metas ────────────────────────────────────────────────────────────────
  const addGoal = useCallback((goal) => {
    updateState({ goals: [...state.goals, goal] });
  }, [state.goals, updateState]);

  const editGoal = useCallback((id, updates) => {
    updateState({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    });
  }, [state.goals, updateState]);

  const deleteGoal = useCallback((id) => {
    updateState({ goals: state.goals.filter((g) => g.id !== id) });
  }, [state.goals, updateState]);

  // ── Settings ─────────────────────────────────────────────────────────────
  const updateSettings = useCallback((settings) => {
    updateState({ settings: { ...state.settings, ...settings } });
  }, [state.settings, updateState]);

  const value = {
    state,
    updateState,
    // Transacciones
    addTransaction,
    editTransaction,
    deleteTransaction,
    // Metas
    addGoal,
    editGoal,
    deleteGoal,
    // Settings
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook para consumir el contexto de la app.
 * @returns {ReturnType<typeof AppProvider>}
 */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
