/**
 * OurSales - Desabilitador de Animações (OTIMIZADO)
 * Remove todas as animações problemáticas via JavaScript
 */

(function () {
  "use strict";

  // Flag para evitar execuções múltiplas
  let animationsDisabled = false;

  console.log("🚫 OurSales - Inicializando desabilitador de animações...");

  // Função para desabilitar animações (executa apenas uma vez)
  function disableAnimations() {
    if (animationsDisabled) {
      return; // Já executou, não executa novamente
    }

    console.log("🚫 OurSales - Desabilitando todas as animações...");

    // Desabilitar todas as animações CSS
    const style = document.createElement("style");
    style.id = "oursales-disable-animations"; // ID para evitar duplicação
    style.textContent = `
      *,
      *::before,
      *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        animation-iteration-count: 1 !important;
        animation-fill-mode: none !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        animation-name: none !important;
        transition-property: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
      
      body,
      main,
      section,
      article,
      header,
      nav,
      footer,
      .card,
      .list-item,
      .table-row,
      .modal-overlay,
      .modal-content {
        opacity: 1 !important;
        animation: none !important;
        transition: none !important;
        transform: none !important;
      }
      
      html {
        scroll-behavior: auto !important;
      }
    `;

    // Verificar se já existe o estilo
    if (!document.getElementById("oursales-disable-animations")) {
      document.head.appendChild(style);
    }

    // Remover classes de animação de todos os elementos
    const animatedElements = document.querySelectorAll(
      ".fade-in, .slide-up, .animate-pulse, .animate-bounce, .animate-spin"
    );
    animatedElements.forEach((el) => {
      el.classList.remove(
        "fade-in",
        "slide-up",
        "animate-pulse",
        "animate-bounce",
        "animate-spin"
      );
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.animation = "none";
      el.style.transition = "none";
    });

    // Forçar elementos a aparecerem imediatamente
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      el.style.opacity = "1";
      el.style.animation = "none";
      el.style.transition = "none";
    });

    animationsDisabled = true;
    console.log("✅ OurSales - Animações desabilitadas com sucesso!");
  }

  // Executar apenas uma vez quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", disableAnimations);
  } else {
    disableAnimations();
  }

  // Observer para elementos dinamicamente adicionados (sem loop)
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            // Element node
            node.style.opacity = "1";
            node.style.animation = "none";
            node.style.transition = "none";

            // Aplicar aos filhos também
            const children = node.querySelectorAll("*");
            children.forEach((child) => {
              child.style.opacity = "1";
              child.style.animation = "none";
              child.style.transition = "none";
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("🎯 OurSales - Sistema de desabilitação de animações ativo!");
})();
