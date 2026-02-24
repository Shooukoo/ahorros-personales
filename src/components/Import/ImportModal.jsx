/* src/components/Import/ImportModal.jsx */
import { useState, useRef, useCallback } from 'react';
import { sileo } from 'sileo';
import { Modal } from '../UI/Modal';
import { useApp } from '../../context/AppContext';
import { saveState } from '../../services/storage';
import {
  parseJSON, parseCSV, parseXLSX, parseTSV, mapRowsToTransactions,
} from '../../services/importService';

// ── Shared styles ─────────────────────────────────────────────────
const inputCls = 'w-full px-3 py-2 rounded-lg text-sm bg-[#141414] border border-[#2a2a2a] text-[#f2f2f2] placeholder-[#5a5a5a] focus:outline-none focus:border-[#7c3aed] transition-colors';
const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a] mb-1.5';

// ── Drag & Drop zone ──────────────────────────────────────────────
function DropZone({ accept, onFile, hint }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center py-10 gap-2
        ${dragging ? 'border-[#7c3aed] bg-[#1a0e2e]' : 'border-[#2a2a2a] hover:border-[#7c3aed]/50 bg-[#0e0e0e]'}`}
    >
      <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#2a2a2a] flex items-center justify-center">
        <svg className="w-5 h-5 text-[#5a5a5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <p className="text-sm text-[#a0a0a0]">Arrastra el archivo aquí</p>
      <p className="text-xs text-[#5a5a5a]">{hint}</p>
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files[0]; if (f) onFile(f); e.target.value = ''; }} />
    </div>
  );
}

// ── Column Mapper ─────────────────────────────────────────────────
const FIELDS = [
  { key: 'name',       label: 'Concepto / Nombre' },
  { key: 'amount',     label: 'Monto' },
  { key: 'category',   label: 'Categoría' },
  { key: 'type',       label: 'Tipo (ingreso/gasto)' },
  { key: 'recurrence', label: 'Recurrencia (fijo/variable)' },
  { key: 'date',       label: 'Fecha' },
];

function ColumnMapper({ headers, mapping, onChange }) {
  return (
    <div className="space-y-2">
      <p className={labelCls}>Mapear columnas</p>
      {FIELDS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-xs text-[#a0a0a0] w-40 flex-shrink-0">{label}</span>
          <select value={mapping[key] || ''} onChange={(e) => onChange(key, e.target.value)}
            className={inputCls + ' flex-1'}>
            <option value="">— ignorar —</option>
            {headers.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

// ── Preview table ─────────────────────────────────────────────────
function PreviewTable({ rows }) {
  const sample = rows.slice(0, 5);
  const headers = sample.length ? Object.keys(sample[0]) : [];
  return (
    <div className="overflow-x-auto rounded-lg border border-[#1c1c1c]">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#1c1c1c]">
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2 text-[#5a5a5a] font-semibold uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sample.map((row, i) => (
            <tr key={i} className="border-b border-[#0e0e0e] last:border-0">
              {headers.map((h) => (
                <td key={h} className="px-3 py-2 text-[#a0a0a0] whitespace-nowrap max-w-[120px] truncate">
                  {String(row[h] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-[#5a5a5a] px-3 py-2 border-t border-[#1c1c1c]">
        Mostrando {sample.length} de {rows.length} filas
      </p>
    </div>
  );
}

// ── Tab: JSON ─────────────────────────────────────────────────────
function JSONTab({ onImport }) {
  const { updateState } = useApp();

  async function handleFile(file) {
    try {
      const text = await file.text();
      const state = parseJSON(text);
      updateState(state);
      onImport();
      sileo.success({ title: 'Respaldo restaurado', description: 'Datos cargados correctamente.' });
    } catch (e) {
      sileo.error({ title: 'Error', description: e.message });
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#5a5a5a]">
        Sube el archivo <span className="text-[#a0a0a0] font-mono">.json</span> descargado desde el botón <strong className="text-[#f2f2f2]">Exportar</strong> de esta misma app. Todos tus datos serán restaurados.
      </p>
      <DropZone accept=".json" onFile={handleFile} hint="Solo archivos .json de respaldo" />
    </div>
  );
}

// ── Tab: CSV ──────────────────────────────────────────────────────
function CSVTab({ onImport }) {
  const { state, updateState } = useApp();
  const [rows,    setRows]    = useState(null);
  const [mapping, setMapping] = useState({});
  const [error,   setError]   = useState('');

  async function handleFile(file) {
    setError('');
    try {
      const text = await file.text();
      setRows(parseCSV(text));
      setMapping({});
    } catch (e) { setError(e.message); }
  }

  function handleMap(key, val) { setMapping((m) => ({ ...m, [key]: val })); }

  function handleImport() {
    try {
      if (!mapping.name || !mapping.amount) {
        setError('Debes mapear al menos "Concepto" y "Monto".');
        return;
      }
      const txns = mapRowsToTransactions(rows, mapping);
      if (!txns.length) { setError('No se encontraron transacciones válidas.'); return; }
      const next = { ...state, transactions: [...state.transactions, ...txns] };
      updateState(next);
      onImport();
      sileo.success({ title: 'CSV importado', description: `${txns.length} transacciones agregadas.` });
    } catch (e) { setError(e.message); }
  }

  const headers = rows ? Object.keys(rows[0] || {}) : [];

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#5a5a5a]">
        Sube el CSV de tu banco (extracto de cuenta). Mapea las columnas para que el sistema entienda qué representa cada una.
      </p>
      <DropZone accept=".csv" onFile={handleFile} hint="Archivos .csv — estados de cuenta bancarios" />
      {rows && (
        <>
          <PreviewTable rows={rows} />
          <ColumnMapper headers={headers} mapping={mapping} onChange={handleMap} />
        </>
      )}
      {error && (
        <p className="text-xs text-[#ef4444] bg-[#1a0808] border border-[#3a1414] rounded-lg px-3 py-2">{error}</p>
      )}
      {rows && (
        <button onClick={handleImport}
          className="w-full py-2.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-semibold transition-all active:scale-95">
          Importar {rows.length} filas
        </button>
      )}
    </div>
  );
}

// ── Tab: Excel ────────────────────────────────────────────────────
function ExcelTab({ onImport }) {
  const { state, updateState } = useApp();
  const [rows,    setRows]    = useState(null);
  const [mapping, setMapping] = useState({});
  const [error,   setError]   = useState('');

  async function handleFile(file) {
    setError('');
    try {
      const buf = await file.arrayBuffer();
      setRows(parseXLSX(buf));
      setMapping({});
    } catch (e) { setError(e.message); }
  }

  function handleMap(key, val) { setMapping((m) => ({ ...m, [key]: val })); }

  function handleImport() {
    try {
      if (!mapping.name || !mapping.amount) {
        setError('Debes mapear al menos "Concepto" y "Monto".');
        return;
      }
      const txns = mapRowsToTransactions(rows, mapping);
      if (!txns.length) { setError('No se encontraron transacciones válidas.'); return; }
      const next = { ...state, transactions: [...state.transactions, ...txns] };
      updateState(next);
      onImport();
      sileo.success({ title: 'Excel importado', description: `${txns.length} transacciones agregadas.` });
    } catch (e) { setError(e.message); }
  }

  const headers = rows ? Object.keys(rows[0] || {}) : [];

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#5a5a5a]">
        Sube tu archivo <span className="font-mono text-[#a0a0a0]">.xlsx</span>. Se leerá la primera hoja del libro. Mapea las columnas para que el sistema las interprete.
      </p>
      <DropZone accept=".xlsx,.xls" onFile={handleFile} hint="Archivos .xlsx o .xls" />
      {rows && (
        <>
          <PreviewTable rows={rows} />
          <ColumnMapper headers={headers} mapping={mapping} onChange={handleMap} />
        </>
      )}
      {error && (
        <p className="text-xs text-[#ef4444] bg-[#1a0808] border border-[#3a1414] rounded-lg px-3 py-2">{error}</p>
      )}
      {rows && (
        <button onClick={handleImport}
          className="w-full py-2.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-semibold transition-all active:scale-95">
          Importar {rows.length} filas
        </button>
      )}
    </div>
  );
}

// ── Tab: Pegar ────────────────────────────────────────────────────
function PasteTab({ onImport }) {
  const { state, updateState } = useApp();
  const [text,    setText]    = useState('');
  const [rows,    setRows]    = useState(null);
  const [mapping, setMapping] = useState({});
  const [error,   setError]   = useState('');

  function handleParse() {
    setError('');
    try {
      setRows(parseTSV(text));
      setMapping({});
    } catch (e) { setError(e.message); }
  }

  function handleMap(key, val) { setMapping((m) => ({ ...m, [key]: val })); }

  function handleImport() {
    try {
      if (!mapping.name || !mapping.amount) {
        setError('Debes mapear al menos "Concepto" y "Monto".');
        return;
      }
      const txns = mapRowsToTransactions(rows, mapping);
      if (!txns.length) { setError('No se encontraron transacciones válidas.'); return; }
      const next = { ...state, transactions: [...state.transactions, ...txns] };
      updateState(next);
      onImport();
      sileo.success({ title: 'Datos importados', description: `${txns.length} transacciones agregadas.` });
    } catch (e) { setError(e.message); }
  }

  const headers = rows ? Object.keys(rows[0] || {}) : [];

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#5a5a5a]">
        Copia las celdas de <strong className="text-[#a0a0a0]">Excel, Google Sheets o Notion</strong> y pégalas abajo. El sistema detecta automáticamente el formato TSV (separado por tabulaciones).
      </p>
      <div>
        <label className={labelCls}>Pegar datos aquí</label>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setRows(null); }}
          placeholder={"Fecha\tConcepto\tMonto\n2026-01-01\tSueldo\t25000\n2026-01-02\tRenta\t-7500"}
          rows={7}
          className={inputCls + ' resize-none font-mono text-xs leading-relaxed'}
        />
      </div>

      <button onClick={handleParse} disabled={!text.trim()}
        className="w-full py-2 rounded-lg border border-[#2a2a2a] hover:border-[#7c3aed] text-[#a0a0a0] hover:text-[#f2f2f2] text-sm font-semibold transition-all disabled:opacity-40">
        Interpretar datos
      </button>

      {rows && (
        <>
          <PreviewTable rows={rows} />
          <ColumnMapper headers={headers} mapping={mapping} onChange={handleMap} />
        </>
      )}

      {error && (
        <p className="text-xs text-[#ef4444] bg-[#1a0808] border border-[#3a1414] rounded-lg px-3 py-2">{error}</p>
      )}

      {rows && (
        <button onClick={handleImport}
          className="w-full py-2.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-semibold transition-all active:scale-95">
          Importar {rows.length} filas
        </button>
      )}
    </div>
  );
}

// ── Modal principal ───────────────────────────────────────────────
const TABS = [
  { id: 'json',  label: 'Respaldo JSON' },
  { id: 'csv',   label: 'CSV Banco' },
  { id: 'excel', label: 'Excel' },
  { id: 'paste', label: 'Pegar' },
];

export function ImportModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('json');

  function handleImport() { onClose(); }

  const tabBtnCls = (active) =>
    `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
      active ? 'bg-[#1c1c1c] text-[#f2f2f2]' : 'text-[#5a5a5a] hover:text-[#a0a0a0]'
    }`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Datos" size="lg">
      <div className="space-y-5">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-lg bg-[#141414] border border-[#1c1c1c]">
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)} className={tabBtnCls(tab === id)}>
              {label}
            </button>
          ))}
        </div>

        {/* Contenido del tab activo */}
        {tab === 'json'  && <JSONTab  onImport={handleImport} />}
        {tab === 'csv'   && <CSVTab   onImport={handleImport} />}
        {tab === 'excel' && <ExcelTab onImport={handleImport} />}
        {tab === 'paste' && <PasteTab onImport={handleImport} />}
      </div>
    </Modal>
  );
}
