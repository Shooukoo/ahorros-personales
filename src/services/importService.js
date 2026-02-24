/* src/services/importService.js
 * Lógica de parseo por formato — sin dependencias de React.
 */
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { generateId } from '../utils/id';

// ── Validar schema JSON de la app ─────────────────────────────────
export function parseJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed.meta || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.goals)) {
    throw new Error('El archivo no tiene el formato de respaldo esperado.');
  }
  return parsed;
}

// ── CSV → array de rows (objetos) ─────────────────────────────────
export function parseCSV(text) {
  const { data, errors } = Papa.parse(text.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  if (errors.length && data.length === 0)
    throw new Error('El archivo CSV no pudo ser interpretado.');
  return data; // [{ col1: val, col2: val, … }]
}

// ── XLSX → array de rows (primer sheet) ──────────────────────────
export function parseXLSX(buffer) {
  const wb    = XLSX.read(buffer, { type: 'array' });
  const ws    = wb.Sheets[wb.SheetNames[0]];
  const rows  = XLSX.utils.sheet_to_json(ws, { defval: '' });
  if (!rows.length) throw new Error('El archivo Excel está vacío.');
  return rows;
}

// ── TSV (pegar desde Excel/Sheets) ───────────────────────────────
export function parseTSV(text) {
  const lines  = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) throw new Error('Necesitas al menos una fila de encabezado y una de datos.');
  const headers = lines[0].split('\t').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split('\t');
    return Object.fromEntries(headers.map((h, i) => [h, (cols[i] ?? '').trim()]));
  });
}

// ── Mapear rows genéricos → transacciones de la app ──────────────
// mapping: { name, amount, category, type, recurrence, date }
//   cada valor es la clave del objeto row o una función row=>valor
export function mapRowsToTransactions(rows, mapping) {
  return rows.map((row) => {
    const get = (key) => {
      if (!key) return '';
      return typeof mapping[key] === 'function' ? mapping[key](row) : (row[mapping[key]] ?? '');
    };

    const rawAmount = String(get('amount')).replace(/[$, ]/g, '');
    const amount    = parseFloat(rawAmount);
    const rawType   = String(get('type')).toLowerCase();

    // Inferir tipo si la columna tiene signo o keyword
    let type = 'expense';
    if (rawType.includes('ingreso') || rawType.includes('income') || rawType.includes('fijo +') || parseFloat(rawAmount) > 0) {
      type = 'income';
    }
    // Soporte para montos negativos como gastos
    const finalAmount = Math.abs(isNaN(amount) ? 0 : amount);

    return {
      id:         generateId('txn'),
      name:       get('name') || 'Sin nombre',
      amount:     finalAmount,
      category:   get('category') || 'Otro',
      type,
      recurrence: get('recurrence') || 'variable',
      createdAt:  get('date') ? new Date(get('date')).toISOString() : new Date().toISOString(),
    };
  }).filter((t) => t.amount > 0);
}
