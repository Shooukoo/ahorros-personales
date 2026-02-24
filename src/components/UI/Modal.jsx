/* src/components/UI/Modal.jsx */
import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${maxW} rounded-t-2xl sm:rounded-2xl border border-[#2a2a2a] shadow-2xl`}
        style={{ background: '#0e0e0e' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1c]">
          <span className="text-sm font-semibold text-[#f2f2f2] tracking-wide uppercase">
            {title}
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5a5a5a] hover:text-[#f2f2f2] hover:bg-[#1c1c1c] transition-all text-lg leading-none"
          >
            ×
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
