/**
 * Sistema de Login/Registro - OurSales Master
 */

// API Base URL
const API_BASE = "/api";

// Elementos DOM

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
  checkAuthStatus();
});

// Configurar event listeners
function setupEventListeners() {
  // Formulário de login
  document.getElementById("loginForm").addEventListener("submit", handleLogin);

  // Enter key handlers
  document
    .getElementById("loginPassword")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        document.getElementById("loginForm").dispatchEvent(new Event("submit"));
      }
    });
}

// Verificar status de autenticação
function checkAuthStatus() {
  const token = localStorage.getItem("oursales:auth-token");
  if (token) {
    // Verificar se o token ainda é válido
    fetch(`${API_BASE}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          // Token válido, redirecionar para admin
          window.location.href = "/admin/";
        } else {
          // Token inválido, remover
          localStorage.removeItem("oursales:auth-token");
          localStorage.removeItem("oursales:user-data");
        }
      })
      .catch(() => {
        // Erro na verificação, remover token
        localStorage.removeItem("oursales:auth-token");
        localStorage.removeItem("oursales:user-data");
      });
  }
}

// Mostrar alerta
function showAlert(message, type = "danger") {
  const alert = document.getElementById("alert");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alert.style.display = "block";

  // Auto-hide após 5 segundos
  setTimeout(hideAlert, 5000);
}

// Esconder alerta
function hideAlert() {
  const alert = document.getElementById("alert");
  alert.style.display = "none";
}

// Mostrar loading
function showLoading(button) {
  const btnText = button.querySelector(".btn-text");
  const loading = button.querySelector(".loading");

  if (btnText) btnText.style.display = "none";
  if (loading) loading.style.display = "flex";

  button.disabled = true;
}

// Esconder loading
function hideLoading(button) {
  const btnText = button.querySelector(".btn-text");
  const loading = button.querySelector(".loading");

  if (btnText) btnText.style.display = "flex";
  if (loading) loading.style.display = "none";

  button.disabled = false;
}

// Validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();

  const form = e.target;
  const button = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);

  const email = formData.get("email");
  const senha = formData.get("senha");

  // Validações
  if (!email || !senha) {
    showAlert("Por favor, preencha todos os campos.");
    return;
  }

  if (!isValidEmail(email)) {
    showAlert("Por favor, insira um email válido.");
    return;
  }

  showLoading(button);
  hideAlert();

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Login bem-sucedido
      localStorage.setItem("oursales:auth-token", data.data.token);
      localStorage.setItem(
        "oursales:user-data",
        JSON.stringify(data.data.usuario)
      );

      showAlert(
        "Login realizado com sucesso! Acessando painel administrativo...",
        "success"
      );

      // Redirecionar após 1 segundo
      setTimeout(() => {
        window.location.href = "/admin/";
      }, 1000);
    } else {
      // Erro no login
      showAlert(
        data.message || "Erro ao fazer login. Verifique suas credenciais."
      );
    }
  } catch (error) {
    console.error("Erro no login:", error);
    showAlert("Erro de conexão. Tente novamente.");
  } finally {
    hideLoading(button);
  }
}

// Mostrar esqueci senha
function showForgotPassword() {
  showAlert(
    "Entre em contato com o suporte para recuperar sua senha.",
    "warning"
  );
}

// Funções globais para o HTML
window.showForgotPassword = showForgotPassword;
