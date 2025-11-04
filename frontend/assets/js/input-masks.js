/**
 * Sistema de Máscaras para Campos de Input
 * Máscaras automáticas para CPF, RG, CNPJ enquanto o usuário digita
 */

/**
 * Aplicar máscara de CPF: 000.000.000-00
 */
function maskCPF(input) {
  let value = input.value.replace(/\D/g, '');
  
  if (value.length <= 11) {
    value = value.replace(/^(\d{3})(\d)/, '$1.$2');
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1-$2');
  }
  
  input.value = value;
}

/**
 * Aplicar máscara de RG: 00.000.000-00
 */
function maskRG(input) {
  let value = input.value.replace(/\D/g, '');
  
  if (value.length <= 10) {
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1-$2');
  }
  
  input.value = value;
}

/**
 * Aplicar máscara de CNPJ: 00.000.000/0000-00
 */
function maskCNPJ(input) {
  if (!input) return;
  
  let value = input.value.replace(/\D/g, '');
  
  // Limitar a 14 dígitos
  if (value.length > 14) {
    value = value.substring(0, 14);
  }
  
  // Aplicar máscara progressivamente enquanto digita
  if (value.length > 0) {
    // Formato: 00.000.000/0000-00
    
    // Se tem 12 ou mais dígitos: aplicar formato completo  
    if (value.length >= 12) {
      const parts = value.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})$/);
      if (parts) {
        value = parts[1] + '.' + parts[2] + '.' + parts[3] + '/' + parts[4];
        if (parts[5] && parts[5].length > 0) {
          value += '-' + parts[5];
        }
      }
    }
    // Se tem de 9 a 11 dígitos: 00.000.000/000
    else if (value.length >= 9) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '$1.$2.$3/$4');
    }
    // Se tem de 6 a 8 dígitos: 00.000.000
    else if (value.length >= 6) {
      value = value.replace(/^(\d{2})(\d{3})(\d+)$/, '$1.$2.$3');
    }
    // Se tem de 3 a 5 dígitos: 00.000
    else if (value.length >= 3) {
      value = value.replace(/^(\d{2})(\d+)$/, '$1.$2');
    }
    // Se tem 1-2 dígitos: mantém como está
  }
  
  input.value = value;
}

/**
 * Inicializar máscaras em todos os campos relevantes da página
 */
function initInputMasks() {
  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyMasks();
      // Aplicar novamente após um pequeno delay para garantir que campos dinâmicos sejam capturados
      setTimeout(applyMasks, 100);
    });
  } else {
    applyMasks();
    // Aplicar novamente após um pequeno delay para garantir que campos dinâmicos sejam capturados
    setTimeout(applyMasks, 100);
  }
}

/**
 * Aplicar máscaras nos campos encontrados
 */
function applyMasks() {
  // Campos CPF
  const cpfFields = document.querySelectorAll('input[name*="cpf"], input[name*="CPF"], input[id*="cpf"], input[id*="CPF"], input[placeholder*="CPF"], input[placeholder*="cpf"]');
  cpfFields.forEach(input => {
    if (!input.hasAttribute('data-mask-applied')) {
      input.setAttribute('data-mask-applied', 'true');
      input.addEventListener('input', () => maskCPF(input));
      input.addEventListener('paste', (e) => {
        setTimeout(() => maskCPF(input), 10);
      });
      // Aplicar máscara se já houver valor
      if (input.value) maskCPF(input);
    }
  });

  // Campos RG
  const rgFields = document.querySelectorAll('input[name*="rg"], input[name*="RG"], input[id*="rg"], input[id*="RG"], input[placeholder*="RG"], input[placeholder*="rg"]');
  rgFields.forEach(input => {
    if (!input.hasAttribute('data-mask-applied')) {
      input.setAttribute('data-mask-applied', 'true');
      input.addEventListener('input', () => maskRG(input));
      input.addEventListener('paste', (e) => {
        setTimeout(() => maskRG(input), 10);
      });
      if (input.value) maskRG(input);
    }
  });

  // Campos CNPJ - procurar por vários padrões incluindo ID específico
  const cnpjSelectors = [
    'input[name*="cnpj"]',
    'input[name*="CNPJ"]',
    'input[id*="cnpj"]',
    'input[id*="CNPJ"]',
<<<<<<< HEAD
    'input[id*="Cnpj"]',
    'input[placeholder*="CNPJ"]',
    'input[placeholder*="cnpj"]',
    '#industriaCNPJ', // ID específico do formulário de indústria
    '#pjCnpj' // ID específico do formulário de cliente PJ
=======
    'input[placeholder*="CNPJ"]',
    'input[placeholder*="cnpj"]',
    '#industriaCNPJ' // ID específico do formulário de indústria
>>>>>>> bd72d4b2c5f875288da0994d0209c0dbaebd340f
  ];
  
  const cnpjFields = document.querySelectorAll(cnpjSelectors.join(', '));
  cnpjFields.forEach(input => {
    if (!input.hasAttribute('data-mask-applied')) {
      input.setAttribute('data-mask-applied', 'true');
      input.addEventListener('input', () => maskCNPJ(input));
      input.addEventListener('paste', (e) => {
        setTimeout(() => maskCNPJ(input), 10);
      });
      // Aplicar máscara se já houver valor
      if (input.value) maskCNPJ(input);
      console.log('Máscara CNPJ aplicada ao campo:', input.name || input.id);
    }
  });

  // Observer para campos dinâmicos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Verificar CPF
          const cpfInputs = node.querySelectorAll ? node.querySelectorAll('input[name*="cpf"], input[name*="CPF"], input[id*="cpf"], input[id*="CPF"]') : [];
          cpfInputs.forEach(input => {
            if (!input.hasAttribute('data-mask-applied')) {
              input.setAttribute('data-mask-applied', 'true');
              input.addEventListener('input', () => maskCPF(input));
            }
          });

          // Verificar RG
          const rgInputs = node.querySelectorAll ? node.querySelectorAll('input[name*="rg"], input[name*="RG"], input[id*="rg"], input[id*="RG"]') : [];
          rgInputs.forEach(input => {
            if (!input.hasAttribute('data-mask-applied')) {
              input.setAttribute('data-mask-applied', 'true');
              input.addEventListener('input', () => maskRG(input));
            }
          });

          // Verificar CNPJ
          const cnpjSelectors = [
            'input[name*="cnpj"]',
            'input[name*="CNPJ"]',
            'input[id*="cnpj"]',
            'input[id*="CNPJ"]',
            '#industriaCNPJ'
          ];
          const cnpjInputs = node.querySelectorAll ? node.querySelectorAll(cnpjSelectors.join(', ')) : [];
          cnpjInputs.forEach(input => {
            if (!input.hasAttribute('data-mask-applied')) {
              input.setAttribute('data-mask-applied', 'true');
              input.addEventListener('input', () => maskCNPJ(input));
              input.addEventListener('paste', (e) => {
                setTimeout(() => maskCNPJ(input), 10);
              });
            }
          });
        }
      });
    });
  });

  // Observar mudanças no DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Inicializar automaticamente quando o script carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInputMasks);
} else {
  // DOM já está pronto - executar imediatamente e depois de um delay
  initInputMasks();
  setTimeout(initInputMasks, 200);
}

// Também exportar para uso global se necessário
window.initInputMasks = initInputMasks;
window.maskCNPJ = maskCNPJ;
window.maskCPF = maskCPF;
window.maskRG = maskRG;

