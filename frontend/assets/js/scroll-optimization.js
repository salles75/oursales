/**
 * Otimizações Avançadas de Scroll
 * Desabilita animações pesadas durante scroll para máxima fluidez
 */

(function() {
  'use strict';

  let isScrolling = false;
  let scrollTimeout = null;
  let ticking = false;

  // Desabilitar animações durante scroll
  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (!isScrolling) {
          isScrolling = true;
          document.documentElement.classList.add('is-scrolling');
        }

        // Resetar flag após scroll parar
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
          document.documentElement.classList.remove('is-scrolling');
        }, 150);

        ticking = false;
      });
      ticking = true;
    }
  }

  // Throttle do scroll event
  let lastScrollY = window.scrollY;
  function onScroll() {
    const currentScrollY = window.scrollY;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY);
    
    // Só processar se scroll foi significativo (evita micro-scrolls)
    if (scrollDelta > 2) {
      handleScroll();
      lastScrollY = currentScrollY;
    }
  }

  // Usar passive listener para melhor performance
  // IMPORTANTE: Aguardar DOM estar pronto antes de adicionar listeners
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('wheel', onScroll, { passive: true });
      window.addEventListener('touchmove', onScroll, { passive: true });
    });
  } else {
    // DOM já está pronto
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });
  }
  
  // NÃO interferir com cliques - deixar os event listeners normais funcionarem
  // Remover a classe apenas após o scroll parar naturalmente
})();

