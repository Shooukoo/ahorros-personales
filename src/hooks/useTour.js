// src/hooks/useTour.js
import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import '../tour.css';

const TOUR_KEY = 'ahorros_tour_completed';

export function useTour(onTabChange) {
  const tourRef = useRef(null);

  function buildTour() {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        // 'instant': el elemento llega a su posición final ANTES de que Floating UI calcule el tooltip
        // Con 'smooth', Floating UI calculaba durante el scroll → tooltip aparecía arriba y luego saltaba abajo
        scrollTo: { behavior: 'instant', block: 'center' },
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 8,
      },
    });

    const btn = {
      back: {
        text: '← Anterior',
        action: () => tour.back(),
        classes: 'shepherd-button-secondary',
      },
      next: {
        text: 'Siguiente →',
        action: () => tour.next(),
      },
      skip: {
        text: 'Saltar',
        action: () => tour.cancel(),
        classes: 'shepherd-button-secondary',
      },
      finish: {
        text: '¡Listo! ✓',
        action: () => tour.complete(),
      },
    };

    const steps = [
      // 1 — Bienvenida (centrado, sin attachTo)
      {
        id: 'welcome',
        title: 'Bienvenido 👋',
        text: 'Este es tu panel de <strong style="color:#f2f2f2">ahorros personales</strong>. Te guiaré en un recorrido rápido por todas las funciones.',
        buttons: [btn.skip, btn.next],
      },

      // 2 — Tarjetas resumen
      {
        id: 'summary-cards',
        title: 'Resumen Financiero',
        text: 'Aquí ves tu <strong style="color:#f2f2f2">balance mensual</strong>: ingresos totales, gastos y tu capacidad de ahorro, todo en un vistazo.',
        attachTo: { element: '[data-tour="summary-cards"]', on: 'bottom' },
        buttons: [btn.back, btn.next],
      },

      // 3 — Gráfico de gastos
      {
        id: 'expense-chart',
        title: 'Distribución de Gastos',
        text: 'El gráfico muestra <strong style="color:#f2f2f2">cómo se distribuyen tus gastos</strong> por categoría. Muy útil para identificar dónde recortar.',
        attachTo: { element: '[data-tour="expense-chart"]', on: 'bottom' },
        buttons: [btn.back, btn.next],
      },

      // 4 — Fondo de emergencia
      {
        id: 'emergency-fund',
        title: 'Fondo de Emergencia',
        text: 'Calcula automáticamente <strong style="color:#f2f2f2">cuánto dinero necesitas</strong> para cubrir varios meses de gastos fijos, y cuánto tiempo tardarías en acumularlo.',
        attachTo: { element: '[data-tour="emergency-fund"]', on: 'bottom' },
        buttons: [btn.back, btn.next],
      },

      // 5 — Botón agregar transacción
      {
        id: 'add-transaction',
        title: 'Agregar Transacción',
        text: 'Con este botón puedes <strong style="color:#f2f2f2">registrar ingresos y gastos</strong> al instante. Todos los datos se guardan en tu dispositivo.',
        attachTo: { element: '[data-tour="add-transaction"]', on: 'bottom' },
        buttons: [btn.back, btn.next],
      },

      // 6 — Tab Transacciones
      {
        id: 'nav-transactions',
        title: 'Transacciones',
        text: 'En esta sección puedes ver, <strong style="color:#f2f2f2">editar y eliminar</strong> todas tus transacciones, filtrando por tipo o categoría.',
        // Función: devuelve el elemento VISIBLE (no el botón desktop oculto con display:none)
        attachTo: {
          element: () => {
            const all = document.querySelectorAll('[data-tour="nav-transactions"]');
            for (const el of all) if (el.offsetParent !== null) return el;
            return all[0];
          },
          on: 'bottom',
        },
        scrollTo: false,
        beforeShowPromise: () =>
          new Promise((resolve) => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            // En móvil: abre el menú hamburguesa para que el botón quede visible
            if (window.innerWidth < 768) {
              window.dispatchEvent(new CustomEvent('tour:open-menu'));
            }
            onTabChange('transactions');
            // 500ms: menú hamburguesa + render de React
            setTimeout(resolve, 500);
          }),
        when: {
          hide: () => onTabChange('dashboard'),
        },
        buttons: [btn.back, btn.next],
      },

      // 7 — Tab Metas
      {
        id: 'nav-goals',
        title: 'Metas de Ahorro',
        text: 'Define <strong style="color:#f2f2f2">objetivos financieros</strong> con un monto meta y sigue tu progreso. La app calcula cuántos meses necesitas para alcanzarlo.',
        attachTo: {
          element: () => {
            const all = document.querySelectorAll('[data-tour="nav-goals"]');
            for (const el of all) if (el.offsetParent !== null) return el;
            return all[0];
          },
          on: 'bottom',
        },
        scrollTo: false,
        beforeShowPromise: () =>
          new Promise((resolve) => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            if (window.innerWidth < 768) {
              window.dispatchEvent(new CustomEvent('tour:open-menu'));
            }
            onTabChange('goals');
            setTimeout(resolve, 500);
          }),
        when: {
          hide: () => onTabChange('dashboard'),
        },
        buttons: [btn.back, btn.next],
      },

      // 8 — Tab Simulador
      {
        id: 'nav-simulator',
        title: 'Simulador de Interés Compuesto',
        text: 'Simula cómo crece tu dinero con <strong style="color:#f2f2f2">interés compuesto</strong>. Ajusta el capital, tasa, tiempo y aportaciones mensuales.',
        attachTo: {
          element: () => {
            const all = document.querySelectorAll('[data-tour="nav-simulator"]');
            for (const el of all) if (el.offsetParent !== null) return el;
            return all[0];
          },
          on: 'bottom',
        },
        scrollTo: false,
        beforeShowPromise: () =>
          new Promise((resolve) => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            if (window.innerWidth < 768) {
              window.dispatchEvent(new CustomEvent('tour:open-menu'));
            }
            onTabChange('simulator');
            setTimeout(resolve, 500);
          }),
        buttons: [btn.back, btn.finish],
      },
    ];

    steps.forEach((step) => tour.addStep(step));

    ['complete', 'cancel'].forEach((event) =>
      tour.on(event, () => {
        localStorage.setItem(TOUR_KEY, 'true');
        onTabChange('dashboard');
      })
    );

    return tour;
  }

  function startTour() {
    // Cancela cualquier tour activo (global o previo) de forma segura
    try { if (Shepherd.activeTour) Shepherd.activeTour.cancel(); } catch (_) {}
    try { if (tourRef.current)    tourRef.current.cancel();    } catch (_) {}

    // Pequeño delay para que Shepherd termine su cleanup antes de iniciar uno nuevo
    setTimeout(() => {
      const tour = buildTour();
      tourRef.current = tour;
      tour.start();
    }, 50);
  }

  useEffect(() => {
    // El banner en App.jsx es el punto de entrada \u2014 no auto-iniciar aqu\u00ed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { startTour };
}
