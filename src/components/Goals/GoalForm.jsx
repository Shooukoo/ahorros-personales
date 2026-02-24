/* src/components/Goals/GoalForm.jsx */
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { generateId } from '../../utils/id';
import { Modal } from '../UI/Modal';

const EMPTY = { name: '', targetAmount: '', currentAmount: '' };

const inputCls = [
  'w-full px-3 py-2.5 rounded-lg text-sm',
  'bg-[#141414] border border-[#2a2a2a] text-[#f2f2f2]',
  'placeholder-[#5a5a5a]',
  'focus:outline-none focus:border-[#7c3aed] transition-colors',
].join(' ');

const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a] mb-1.5';

export function GoalForm({ isOpen, onClose, editTarget }) {
  const { addGoal, editGoal } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(editTarget
      ? { name: editTarget.name, targetAmount: String(editTarget.targetAmount),
          currentAmount: String(editTarget.currentAmount) }
      : EMPTY
    );
    setError('');
  }, [editTarget, isOpen]);

  function set(f, v) { setForm((p) => ({ ...p, [f]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim())                    return setError('El nombre es obligatorio.');
    if (!form.targetAmount || +form.targetAmount <= 0) return setError('Ingresa un monto objetivo válido.');
    if (+form.currentAmount < 0)              return setError('El ahorro actual no puede ser negativo.');

    const goal = {
      id: editTarget?.id ?? generateId('goal'),
      name: form.name.trim(),
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount || 0),
      icon: editTarget?.icon ?? '◎',
      createdAt: editTarget?.createdAt ?? new Date().toISOString(),
    };
    editTarget ? editGoal(editTarget.id, goal) : addGoal(goal);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTarget ? 'Editar Meta' : 'Nueva Meta'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Nombre de la meta</label>
          <input className={inputCls} placeholder="Laptop, Viaje, Fondo de emergencia…"
            value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>

        <div>
          <label className={labelCls}>Monto objetivo (MXN)</label>
          <input className={inputCls} type="number" min="1" step="0.01" placeholder="20000"
            value={form.targetAmount} onChange={(e) => set('targetAmount', e.target.value)} />
        </div>

        <div>
          <label className={labelCls}>Ya tengo ahorrado (MXN)</label>
          <input className={inputCls} type="number" min="0" step="0.01" placeholder="0"
            value={form.currentAmount} onChange={(e) => set('currentAmount', e.target.value)} />
        </div>

        {error && (
          <p className="text-xs text-[#ef4444] bg-[#1a0808] border border-[#3a1414] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit"
          className="w-full py-2.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-semibold transition-all active:scale-95">
          {editTarget ? 'Guardar cambios' : 'Crear meta'}
        </button>
      </form>
    </Modal>
  );
}
