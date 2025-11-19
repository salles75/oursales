/**
 * Performance Optimizer
 * Otimizações para melhorar o desempenho do site
 */

(function() {
  'use strict';

  // ============================================
  // 1. LAZY LOADING DE IMAGENS
  // ============================================
  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // ============================================
  // 2. DEBOUNCE E THROTTLE HELPERS
  // ============================================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ============================================
  // 3. OTIMIZAÇÃO DE SCROLL (CONSOLIDADO)
  // ============================================
  // NOTA: Scroll optimization está em scroll-optimization.js
  // Esta função foi removida para evitar múltiplos listeners
  function optimizeScroll() {
    // Scroll optimization já está sendo feita por scroll-optimization.js
    // Não adicionar listeners duplicados aqui
  }

  // ============================================
  // 4. DEFER LOADING DE SCRIPTS PESADOS
  // ============================================
  function loadScriptDeferred(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    if (callback) {
      script.onload = callback;
    }
    document.body.appendChild(script);
  }

  // ============================================
  // 5. OTIMIZAÇÃO DE DOM QUERIES
  // ============================================
  const domCache = new Map();
  
  function getCachedElement(selector) {
    if (!domCache.has(selector)) {
      const element = document.querySelector(selector);
      if (element) {
        domCache.set(selector, element);
      }
      return element;
    }
    return domCache.get(selector);
  }

  // ============================================
  // 6. PREVENT LAYOUT SHIFT
  // ============================================
  function preventLayoutShift() {
    // Adicionar dimensões mínimas para elementos que podem causar shift
    const style = document.createElement('style');
    style.textContent = `
      img:not([width]):not([height]) {
        aspect-ratio: attr(width) / attr(height);
      }
      .modern-form-section-icon {
        min-width: 48px;
        min-height: 48px;
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // 7. OTIMIZAÇÃO DE EVENT LISTENERS
  // ============================================
  function optimizeEventListeners() {
    // Usar event delegation para reduzir listeners
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (target) {
        const action = target.dataset.action;
        // Handler será implementado conforme necessário
      }
    }, { passive: true });
  }

  // ============================================
  // 8. MEMORY CLEANUP
  // ============================================
  function cleanupMemory() {
    // Limpar cache periodicamente
    setInterval(() => {
      if (domCache.size > 100) {
        domCache.clear();
      }
    }, 60000); // A cada minuto
  }

  // ============================================
  // 9. CRITICAL CSS INLINE
  // ============================================
  function inlineCriticalCSS() {
    // CSS crítico já está inline ou será carregado primeiro
    // Esta função pode ser expandida para extrair CSS crítico
  }

  // ============================================
  // 10. RESOURCE HINTS
  // ============================================
  function addResourceHints() {
    const hints = [
      { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' },
      { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' },
    ];

    hints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      document.head.appendChild(link);
    });
  }

  // ============================================
  // 11. DEFER NON-CRITICAL CSS
  // ============================================
  function deferNonCriticalCSS() {
    const nonCriticalSheets = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
    nonCriticalSheets.forEach(sheet => {
      sheet.media = 'print';
      sheet.onload = function() {
        this.media = 'all';
      };
    });
  }

  // ============================================
  // 12. REDUCE REPAINT/REFLOW
  // ============================================
  function batchDOMUpdates() {
    // Agrupar múltiplas atualizações DOM
    let updateQueue = [];
    let rafId = null;

    function flushUpdates() {
      updateQueue.forEach(update => update());
      updateQueue = [];
      rafId = null;
    }

    window.batchDOMUpdate = function(updateFn) {
      updateQueue.push(updateFn);
      if (!rafId) {
        rafId = requestAnimationFrame(flushUpdates);
      }
    };
  }

  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  function init() {
    // Executar imediatamente
    addResourceHints();
    preventLayoutShift();
    batchDOMUpdates();
    optimizeEventListeners();
    cleanupMemory();

    // Executar após DOM carregado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initLazyLoading();
        optimizeScroll();
        deferNonCriticalCSS();
      });
    } else {
      initLazyLoading();
      optimizeScroll();
      deferNonCriticalCSS();
    }
  }

  // Inicializar
  init();

  // Exportar funções úteis
  window.performanceOptimizer = {
    debounce,
    throttle,
    getCachedElement,
    loadScriptDeferred,
  };
})();

