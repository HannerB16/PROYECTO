// FileName: /Proyecto_Pagina_Web/Backend/static/JS/utils.js

/**
 * MÓDULO PRINCIPAL DE UTILIDADES
 * @version 1.5.0
 * @description Utilidades completas para manejo de DOM, HTTP, validaciones,
 *              localStorage, cookies y autenticación JWT.
 */

class AuthManager {
  constructor() {
    this.tokenKey = 'authToken';
    this.userKey = 'userData';
  }

  /**
   * Almacena los datos de autenticación
   * @param {string} token - JWT token
   * @param {object} userData - Datos del usuario
   */
  setAuth(token, userData) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(userData));
    
    // Configurar cookie para SSR (opcional)
    this.setCookie('authToken', token, 1); // 1 día de expiración
  }

  /**
   * Obtiene el token almacenado
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem(this.tokenKey) || 
           this.getCookie('authToken');
  }

  /**
   * Obtiene los datos del usuario
   * @returns {object|null} User data
   */
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.getToken() !== null;
  }

  /**
   * Verifica si el usuario es administrador
   * @returns {boolean}
   */
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }

  /**
   * Cierra la sesión
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.deleteCookie('authToken');
    window.location.href = '/login';
  }

  /**
   * Manejo de cookies
   */
  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  }

  getCookie(name) {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const cookie = cookies.find(c => c.startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
  }

  deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  /**
   * Decodifica el JWT
   * @param {string} token 
   * @returns {object|null} Payload decodificado
   */
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  /**
   * Verifica validez del token JWT
   * @returns {boolean}
   */
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;
    
    const decoded = this.decodeToken(token);
    if (!decoded) return false;
    
    const now = Date.now() / 1000;
    return decoded.exp > now;
  }
}

class HttpService {
  constructor() {
    this.baseURL = window.location.origin;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async request(method, endpoint, data = null, customHeaders = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const authToken = new AuthManager().getToken();
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config = {
      method,
      headers,
      credentials: 'same-origin'
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error(`HTTP ${method} error:`, error);
      throw error;
    }
  }

  get(endpoint, params = {}, headers = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `${endpoint}?${queryString}`, null, headers);
  }

  post(endpoint, data, headers = {}) {
    return this.request('POST', endpoint, data, headers);
  }

  put(endpoint, data, headers = {}) {
    return this.request('PUT', endpoint, data, headers);
  }

  delete(endpoint, headers = {}) {
    return this.request('DELETE', endpoint, null, headers);
  }
}

class FormValidator {
  static validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }

  static validatePassword(password) {
    // Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  }

  static validateForm(formData, rules) {
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
      if (rule.required && !formData[field]) {
        errors[field] = 'Este campo es requerido';
        continue;
      }

      if (rule.type === 'email' && !this.validateEmail(formData[field])) {
        errors[field] = 'Ingrese un email válido';
      }

      if (rule.type === 'password' && !this.validatePassword(formData[field])) {
        errors[field] = 'La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un caracter especial';
      }

      if (rule.minLength && formData[field].length < rule.minLength) {
        errors[field] = `Mínimo ${rule.minLength} caracteres`;
      }

      if (rule.equals && formData[field] !== formData[rule.equals]) {
        errors[field] = `Los valores no coinciden`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

class UIManager {
  static showLoading(element) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = '<div class="spinner"></div>';
    element.style.position = 'relative';
    element.appendChild(loadingDiv);
  }

  static hideLoading(element) {
    const loader = element.querySelector('.loading-overlay');
    if (loader) {
      loader.remove();
    }
  }

  static showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 500);
    }, duration);
  }

  static showModal(title, content, buttons = []) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    const modalContent = `
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <span class="close-modal">&times;</span>
        </div>
        <div class="modal-body">${content}</div>
        <div class="modal-footer">
          ${buttons.map(btn => `<button class="btn btn-${btn.type}">${btn.text}</button>`).join('')}
        </div>
      </div>
    `;
    
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
    
    // Button handlers
    buttons.forEach((btn, index) => {
      modal.querySelectorAll('.modal-footer button')[index]
        .addEventListener('click', btn.handler || (() => modal.remove()));
    });
    
    return modal;
  }
}

class StorageManager {
  static save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static load(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}

// API de utilidades expuesta globalmente
window.AppUtils = {
  Auth: new AuthManager(),
  Http: new HttpService(),
  Validator: FormValidator,
  UI: UIManager,
  Storage: StorageManager,
  
  // Helper functions
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  formatDate(date, options = {}) {
    const defaults = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, { ...defaults, ...options });
  },

  sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  redirect(url, delay = 0) {
    if (delay > 0) {
      setTimeout(() => window.location.href = url, delay);
    } else {
      window.location.href = url;
    }
  },

  // Inicialización de componentes comunes
  initAuthForms() {
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
          email: loginForm.email.value,
          password: loginForm.password.value
        };
        
        try {
          UIManager.showLoading(loginForm);
          const response = await AppUtils.Http.post('/api/auth/login', formData);
          
          AppUtils.Auth.setAuth(response.token, response.user);
          AppUtils.UI.showToast('Login exitoso', 'success');
          AppUtils.redirect(AppUtils.Auth.isAdmin() ? '/admin' : '/dashboard', 1500);
        } catch (error) {
          AppUtils.UI.showToast(error.message || 'Error en el login', 'error');
        } finally {
          UIManager.hideLoading(loginForm);
        }
      });
    }

    // Logout button handler
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        AppUtils.Auth.logout();
      });
    });

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
          name: registerForm.name.value,
          email: registerForm.email.value,
          password: registerForm.password.value,
          password_confirmation: registerForm.password_confirmation.value
        };
        
        const validation = AppUtils.Validator.validateForm(formData, {
          name: { required: true, minLength: 3 },
          email: { required: true, type: 'email' },
          password: { required: true, type: 'password' },
          password_confirmation: { required: true, equals: 'password' }
        });
        
        if (!validation.isValid) {
          AppUtils.UI.showToast(Object.values(validation.errors)[0], 'error');
          return;
        }
        
        try {
          UIManager.showLoading(registerForm);
          const response = await AppUtils.Http.post('/api/auth/register', formData);
          
          AppUtils.Auth.setAuth(response.token, response.user);
          AppUtils.UI.showToast('Registro exitoso', 'success');
          AppUtils.redirect('/dashboard', 1500);
        } catch (error) {
          AppUtils.UI.showToast(error.message || 'Error en el registro', 'error');
        } finally {
          UIManager.hideLoading(registerForm);
        }
      });
    }
  }
};

// Inicialización automática cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  // Protección de rutas
  const authRoutes = ['/dashboard', '/admin', '/profile'];
  const currentPath = window.location.pathname;
  
  if (authRoutes.some(route => currentPath.startsWith(route))) {
    if (!AppUtils.Auth.isAuthenticated()) {
      AppUtils.redirect('/login');
    } else if (currentPath.startsWith('/admin') && !AppUtils.Auth.isAdmin()) {
      AppUtils.redirect('/dashboard');
    }
  }

  // Inicializar formularios de autenticación
  AppUtils.initAuthForms();
  
  // Actualizar UI basado en estado de autenticación
  const authStateElements = document.querySelectorAll('[data-auth-state]');
  authStateElements.forEach(el => {
    const state = el.getAttribute('data-auth-state');
    const shouldShow = state === 'authenticated' ? AppUtils.Auth.isAuthenticated() : 
                     state === 'unauthenticated' ? !AppUtils.Auth.isAuthenticated() : 
                     state === 'admin' ? AppUtils.Auth.isAdmin() : false;
    
    if (shouldShow) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
});

// CSS para componentes UI
const style = document.createElement('style');
style.textContent = `
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 4px;
    color: white;
    animation: slideIn 0.3s;
    z-index: 10000;
  }
  
  .toast-success {
    background-color: #28a745;
  }
  
  .toast-error {
    background-color: #dc3545;
  }
  
  .toast-warning {
    background-color: #ffc107;
  }
  
  .toast.fade-out {
    animation: fadeOut 0.5s;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal {
    background: white;
    border-radius: 8px;
    min-width: 300px;
    max-width: 80%;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  .modal-header {
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
  }
  
  .btn-primary {
    background-color: #007bff;
    color: white;
  }
  
  .btn-danger {
    background-color: #dc3545;
    color: white;
  }
  
  .close-modal {
    font-size: 24px;
    cursor: pointer;
  }
`;
document.head.appendChild(style);
