// src/services/storage.js

const STORAGE_KEY = 'ahorros_app_v1';

const DEFAULT_STATE = {
  meta: {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currency: 'MXN',
  },
  settings: {
    userName: 'Usuario',
    monthlyInterestRate: 11,   // % anual (CETES referencia)
    emergencyFundMonths: 3,
  },
  transactions: [],
  goals: [],
};

/**
 * Lee el estado completo desde LocalStorage.
 * Si no existe o está corrupto, devuelve y guarda el estado por defecto.
 * @returns {Object} AppState
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initializeState();

    const parsed = JSON.parse(raw);

    if (parsed?.meta?.version !== DEFAULT_STATE.meta.version) {
      console.warn('[Storage] Versión incompatible. Reiniciando estado.');
      return initializeState();
    }

    return parsed;
  } catch (error) {
    console.error('[Storage] Error leyendo LocalStorage:', error);
    return initializeState();
  }
}

/**
 * Guarda el estado completo en LocalStorage, actualizando updatedAt.
 * @param {Object} state
 */
export function saveState(state) {
  try {
    const stateToSave = {
      ...state,
      meta: { ...state.meta, updatedAt: new Date().toISOString() },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('[Storage] Error guardando en LocalStorage:', error);
    throw new Error('No se pudo guardar. Almacenamiento lleno.');
  }
}

/**
 * Inicializa el estado por defecto, lo persiste y lo devuelve.
 */
function initializeState() {
  saveState(DEFAULT_STATE);
  return structuredClone(DEFAULT_STATE);
}

/**
 * Exporta el estado como archivo JSON descargable.
 */
export function exportData(state) {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ahorros-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Importa datos desde un archivo JSON y los valida.
 * @param {File} file
 * @returns {Promise<Object>} AppState importado
 */
export async function importData(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (!parsed.meta || !parsed.transactions || !parsed.goals) {
    throw new Error('Archivo inválido: no tiene el formato esperado.');
  }

  saveState(parsed);
  return parsed;
}
