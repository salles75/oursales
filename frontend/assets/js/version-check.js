/**
 * Sistema de Verificação Automática de Versão
 * Verifica periodicamente se há uma nova versão da aplicação
 * e recarrega automaticamente quando detecta atualização
 */

(function () {
  'use strict';

  const CHECK_INTERVAL = 5 * 60 * 1000; // Verifica a cada 5 minutos
  const VERSION_KEY = 'oursales-app-version';
  const CHECKING_KEY = 'oursales-version-checking';

  let checkInterval = null;
  let isChecking = false;

  /**
   * Adiciona ?v=<hash> nos recursos estáticos e recarrega-os sem recarregar a página
   */
  function bustStaticAssets(versionHash) {
    const addParam = (url) => {
      try {
        const u = new URL(url, window.location.origin);
        u.searchParams.set('v', versionHash);
        return u.pathname + u.search + u.hash;
      } catch (e) {
        // URLs relativas simples
        const [path, query = ''] = url.split('?');
        const params = new URLSearchParams(query);
        params.set('v', versionHash);
        return `${path}?${params.toString()}`;
      }
    };

    // CSS
    document.querySelectorAll('link[rel="stylesheet"][href]')
      .forEach((link) => {
        const newHref = addParam(link.getAttribute('href'));
        const clone = link.cloneNode(true);
        clone.setAttribute('href', newHref);
        link.replaceWith(clone);
      });

    // JS (exceto este script para evitar loop)
    const currentScriptName = 'version-check.js';
    document.querySelectorAll('script[src]')
      .forEach((script) => {
        const src = script.getAttribute('src');
        if (!src) return;
        if (src.includes(currentScriptName)) return;
        const newSrc = addParam(src);
        const clone = document.createElement('script');
        // Copiar atributos relevantes
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name === 'src') return;
          clone.setAttribute(attr.name, attr.value);
        });
        clone.async = script.async;
        clone.defer = script.defer;
        clone.src = newSrc;
        // Inserir clone e remover original quando carregar
        clone.addEventListener('load', () => {
          script.remove();
        });
        script.parentNode.insertBefore(clone, script.nextSibling);
      });
  }

  /**
   * Obtém a versão atual do servidor
   */
  async function fetchServerVersion() {
    try {
      const response = await fetch('/api/version', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache', // Sempre buscar versão mais recente
      });

      if (!response.ok) {
        console.warn('Erro ao verificar versão:', response.status);
        return null;
      }

      const result = await response.json();
      if (result.success && result.data) {
        return result.data.hash; // Retorna apenas o hash da versão
      }

      return null;
    } catch (error) {
      console.warn('Erro ao verificar versão:', error);
      return null;
    }
  }

  /**
   * Obtém a versão atual salva no sessionStorage
   */
  function getCurrentVersion() {
    try {
      return sessionStorage.getItem(VERSION_KEY);
    } catch (e) {
      return null;
    }
  }

  /**
   * Salva a versão atual no sessionStorage
   */
  function setCurrentVersion(version) {
    try {
      sessionStorage.setItem(VERSION_KEY, version);
    } catch (e) {
      console.warn('Erro ao salvar versão:', e);
    }
  }

  /**
   * Mostra notificação de atualização
   */
  function showUpdateNotification() {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.id = 'version-update-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
      max-width: 350px;
    `;

    notification.innerHTML = `
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">🔄 Nova versão disponível</div>
        <div style="font-size: 12px; opacity: 0.9;">Atualizando automaticamente...</div>
      </div>
      <div style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    `;

    // Adicionar animação CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Remover notificação após 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }

  /**
   * Verifica se há nova versão e recarrega se necessário
   */
  async function checkForUpdates() {
    // Evitar múltiplas verificações simultâneas
    if (isChecking) {
      return;
    }

    // Verificar se já está checando (evitar loops)
    const checking = sessionStorage.getItem(CHECKING_KEY);
    if (checking === 'true') {
      return;
    }

    isChecking = true;
    sessionStorage.setItem(CHECKING_KEY, 'true');

    try {
      const serverVersion = await fetchServerVersion();
      
      if (!serverVersion) {
        // Se não conseguiu因为是versão, não faz nada (não interrompe o uso)
        return;
      }

      const currentVersion = getCurrentVersion();

      // Se não há versão salva: primeira visita na sessão
      if (!currentVersion) {
        // Forçar atualização dos assets na primeira entrada
        bustStaticAssets(serverVersion);
        setCurrentVersion(serverVersion);
        return;
      }

      // Se a versão mudou, há uma atualização disponível
      if (serverVersion !== currentVersion) {
        console.log('Nova versão detectada:', serverVersion);
        
        // Mostrar notificação
        showUpdateNotification();

        // Bust de cache nos assets imediatamente, sem recarregar a página
        bustStaticAssets(serverVersion);
        setCurrentVersion(serverVersion);
      }
    } catch (error) {
      console.warn('Erro ao verificar atualização:', error);
    } finally {
      isChecking = false;
      sessionStorage.removeItem(CHECKING_KEY);
    }
  }

  /**
   * Inicializa o verificador de versão
   */
  function init() {
    // Verificar imediatamente após carregar (com pequeno delay para não competir com outros recursos)
    setTimeout(checkForUpdates, 2000);

    // Verificar periodicamente
    checkInterval = setInterval(checkForUpdates, CHECK_INTERVAL);

    // Verificar também quando a página ganha foco (usuário volta à aba)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    });

    // Verificar quando a conexão volta (se estava offline)
    window.addEventListener('online', () => {
      setTimeout(checkForUpdates, 1000);
    });
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exportar para uso global (caso necessário)
  window.versionChecker = {
    check: checkForUpdates,
    stop: () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    },
  };
})();

