// src/utils/finance.js

/**
 * Calcula ingresos totales del mes.
 * @param {Array} transactions
 * @returns {number}
 */
export function getTotalIncome(transactions) {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calcula gastos totales del mes.
 * @param {Array} transactions
 * @returns {number}
 */
export function getTotalExpenses(transactions) {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Capacidad de ahorro mensual = Ingresos - Gastos.
 * @param {Array} transactions
 * @returns {number}
 */
export function getMonthlySavings(transactions) {
  return getTotalIncome(transactions) - getTotalExpenses(transactions);
}

/**
 * Meses para alcanzar una meta dado el ahorro mensual.
 * @param {number} targetAmount
 * @param {number} monthlySavings
 * @returns {number | null} null si el ahorro es 0 o negativo
 */
export function getMonthsToGoal(targetAmount, monthlySavings) {
  if (monthlySavings <= 0) return null;
  return Math.ceil(targetAmount / monthlySavings);
}

/**
 * Valor futuro de anualidades (interés compuesto mensual).
 *
 * FV = PMT × [ ((1 + r)^n - 1) / r ]
 *
 * @param {number} pmt  - Pago mensual (ahorro mensual)
 * @param {number} annualRate - Tasa anual en % (ej. 11)
 * @param {number} months - Número de meses
 * @returns {number} Valor futuro
 */
export function getFutureValue(pmt, annualRate, months) {
  if (pmt <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12; // tasa mensual
  if (r === 0) return pmt * months;
  return pmt * ((Math.pow(1 + r, months) - 1) / r);
}

/**
 * Fondo de emergencia recomendado.
 * = Gastos fijos mensuales × multiplicador (default 3 meses).
 * @param {Array} transactions
 * @param {number} months
 * @returns {number}
 */
export function getEmergencyFund(transactions, months = 3) {
  const fixedExpenses = transactions
    .filter((t) => t.type === 'expense' && t.recurrence === 'fixed')
    .reduce((sum, t) => sum + t.amount, 0);
  return fixedExpenses * months;
}

/**
 * Agrupa los gastos por categoría y devuelve { category: total }.
 * @param {Array} transactions
 * @returns {Object}
 */
export function getExpensesByCategory(transactions) {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
}

/**
 * Formatea un número como moneda MXN.
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount);
}
