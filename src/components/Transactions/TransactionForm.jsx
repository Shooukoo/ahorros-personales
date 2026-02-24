/* src/components/Transactions/TransactionForm.jsx */
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { generateId } from '../../utils/id';
import { Modal } from '../UI/Modal';

const CATEGORIES_INCOME  = ['Trabajo','Freelance','Inversiones','Negocio','Regalo','Otro'];
const CATEGORIES_EXPENSE = [
  'Vivienda','Alimentación','Transporte','Salud','Educación',
  'Entretenimiento','Ropa','Servicios','Tecnología','Deudas','Otro',
];

const EMPTY = { name:'', amount:'', category:'', type:'expense', recurrence:'fixed' };

const inputCls = [
  'w-full px-3 py-2.5 rounded-lg text-sm',
  'bg-[#141414] border border-[#2a2a2a] text-[#f2f2f2]',
  'placeholder-[#5a5a5a]',
  'focus:outline-none focus:border-[#7c3aed] transition-colors',
].join(' ');

const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a] mb-1.5';

export function TransactionForm({ isOpen, onClose, editTarget }) {
  const { addTransaction, editTransaction } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(editTarget
      ? { name: editTarget.name, amount: String(editTarget.amount),
          category: editTarget.category, type: editTarget.type, recurrence: editTarget.recurrence }
      : EMPTY
    );
    setError('');
  }, [editTarget, isOpen]);

  const categories = form.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value, ...(field === 'type' ? { category: '' } : {}) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim())                              return setError('El nombre es obligatorio.');
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) return setError('Monto inválido.');
    if (!form.category)                                 return setError('Selecciona una categoría.');

    const txn = {
      id: editTarget?.id ?? generateId('txn'),
      name: form.name.trim(), amount: parseFloat(form.amount),
      category: form.category, type: form.type, recurrence: form.recurrence,
      createdAt: editTarget?.createdAt ?? new Date().toISOString(),
    };
    editTarget ? editTransaction(editTarget.id, txn) : addTransaction(txn);
    onClose();
  }

  const segBtnCls = (active, color = 'accent') => {
    const colors = {
      accent:   active ? 'bg-[#7c3aed] text-white' : 'text-[#5a5a5a] hover:text-[#a0a0a0]',
      positive: active ? 'bg-[#16a34a] text-white'  : 'text-[#5a5a5a] hover:text-[#a0a0a0]',
      negative: active ? 'bg-[#b91c1c] text-white'  : 'text-[#5a5a5a] hover:text-[#a0a0a0]',
    };
    return `flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${colors[color]}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={editTarget ? 'Editar Transacción' : 'Nueva Transacción'}>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Tipo — toggle */}
        <div className="flex gap-1 p-1 rounded-lg bg-[#141414] border border-[#1c1c1c]">
          <button type="button" onClick={() => set('type','expense')}
            className={segBtnCls(form.type === 'expense', 'negative')}>
            Gasto
          </button>
          <button type="button" onClick={() => set('type','income')}
            className={segBtnCls(form.type === 'income', 'positive')}>
            Ingreso
          </button>
        </div>

        {/* Nombre */}
        <div>
          <label className={labelCls}>Nombre</label>
          <input className={inputCls} placeholder="Sueldo mensual, Renta, Spotify…"
            value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>

        {/* Monto */}
        <div>
          <label className={labelCls}>Monto (MXN)</label>
          <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00"
            value={form.amount} onChange={(e) => set('amount', e.target.value)} />
        </div>

        {/* Categoría */}
        <div>
          <label className={labelCls}>Categoría</label>
          <select className={inputCls} value={form.category}
            onChange={(e) => set('category', e.target.value)}>
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Recurrencia */}
        <div>
          <label className={labelCls}>Recurrencia</label>
          <div className="flex gap-1 p-1 rounded-lg bg-[#141414] border border-[#1c1c1c]">
            {[['fixed','Fijo'],['variable','Variable']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => set('recurrence', val)}
                className={segBtnCls(form.recurrence === val)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs text-[#ef4444] bg-[#1a0808] border border-[#3a1414] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit"
          className="w-full py-2.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-semibold transition-all active:scale-95">
          {editTarget ? 'Guardar cambios' : 'Agregar'}
        </button>
      </form>
    </Modal>
  );
}
