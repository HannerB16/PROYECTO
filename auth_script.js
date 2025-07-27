// FileName: /Proyecto_Pagina_Web/Backend/static/JS/auth_script.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const passwordResetForm = document.getElementById('password-reset-form');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const resetSection = document.getElementById('reset-section');
    const twoFactorForm = document.getElementById('two-factor-form');
    const twoFactorSection = document.getElementById('two-factor-section');
    const sessionExpiredModal = document.getElementById('session-expired-modal');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Configuración global
    const API_BASE_URL = '/api/auth';
    const MIN_PASSWORD_LENGTH = 8;
    const PASSWORD_REQUIREMENTS = {
        minLength: MIN_PASSWORD_LENGTH,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true
    };
    
    // Estado de la aplicación
    let authState = {
        currentUser: null,
        loginAttempts: 0,
        isSessionExpired: false
    };
    
    // Inicialización
    checkSession();
    setupEventListeners();
    applyFormValidations();
    checkUrlParams();
    
    /**
     * Verifica el estado de la sesión al cargar la página
     */
    function checkSession() {
        const token = getCookie('auth_token');
        if (token) {
            validateToken(token)
                .then(user => {
                    authState.currentUser = user;
                    redirectToDashboard();
                })
                .catch(() => {
                    clearAuthCookies();
                });
        }
    }
    
    /**
     * Configura los event listeners
     */
    function setupEventListeners() {
        // Mostrar/ocultar secciones
        if (showRegisterLink && showLoginLink) {
            showRegisterLink.addEventListener('click', function(e) {
                e.preventDefault();
                loginSection.classList.add('d-none');
                registerSection.classList.remove('d-none');
                resetSection.classList.add('d-none');
                clearFormErrors(loginForm);
            });
            
            showLoginLink.addEventListener('click', function(e) {
                e.preventDefault();
                registerSection.classList.add('d-none');
                loginSection.classList.remove('d-none');
                resetSection.classList.add('d-none');
                clearFormErrors(registerForm);
            });
            
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                loginSection.classList.add('d-none');
                registerSection.classList.add('d-none');
                resetSection.classList.remove('d-none');
            });
        }
        
        // Formulario de login
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleLogin();
            });
        }
        
        // Formulario de registro
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleRegistration();
            });
        }
        
        // Formulario de restablecimiento
        if (passwordResetForm) {
            passwordResetForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handlePasswordReset();
            });
        }
        
        // Formulario de 2FA
        if (twoFactorForm) {
            twoFactorForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleTwoFactorVerification();
            });
        }
        
        // Botón de logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
        
        // Verificar actividad del usuario
        document.addEventListener('mousemove', resetIdleTimer);
        document.addEventListener('keypress', resetIdleTimer);
        startIdleTimer();
    }
    
    /**
     * Aplica validaciones a los formularios
     */
    function applyFormValidations() {
        validateEmailFields();
        validatePasswordFields();
    }
    
    /**
     * Valida campos de email
     */
    function validateEmailFields() {
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', function() {
                const email = this.value.trim();
                const errorElement = document.getElementById(`${this.id}-error`);
                
                if (!email) {
                    showError(this, errorElement, 'El email es requerido');
                    return;
                }
                
                if (!isValidEmail(email)) {
                    showError(this, errorElement, 'Ingresa un email válido');
                    return;
                }
                
                clearError(this, errorElement);
            });
        });
    }
    
    /**
     * Valida campos de contraseña
     */
    function validatePasswordFields() {
        document.querySelectorAll('input[type="password"]').forEach(input => {
            input.addEventListener('blur', function() {
                const password = this.value;
                const errorElement = document.getElementById(`${this.id}-error`);
                
                if (!password) {
                    showError(this, errorElement, 'La contraseña es requerida');
                    return;
                }
                
                if (this.id === 'register-password' || this.id === 'new-password') {
                    const validation = validatePasswordStrength(password);
                    if (!validation.isValid) {
                        showError(this, errorElement, validation.message);
                        return;
                    }
                }
                
                if (this.id === 'confirm-password') {
                    const originalPassword = document.getElementById('register-password').value;
                    if (password !== originalPassword) {
                        showError(this, errorElement, 'Las contraseñas no coinciden');
                        return;
                    }
                }
                
                clearError(this, errorElement);
            });
        });
    }
    
    /**
     * Maneja el proceso de login
     */
    async function handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        if (!email || !password) {
            showAlert('error', 'Por favor completa todos los campos');
            return;
        }
        
        showLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, rememberMe })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401 && data.requires2fa) {
                    show2FASection();
                    return;
                }
                
                authState.loginAttempts++;
                handleFailedLogin(data.message || 'Error en el login');
                return;
            }
            
            // Login exitoso
            authState.loginAttempts = 0;
            setAuthCookies(data.token, rememberMe);
            authState.currentUser = data.user;
            
            if (data.requires2faSetup) {
                show2FASetup(data.twoFactorUrl);
            } else {
                redirectToDashboard();
            }
            
        } catch (error) {
            showAlert('error', 'Error de conexión. Intenta nuevamente.');
            console.error('Login error:', error);
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Maneja el proceso de registro
     */
    async function handleRegistration() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const termsAccepted = document.getElementById('accept-terms').checked;
        
        // Validaciones
        if (!name || !email || !password || !confirmPassword) {
            showAlert('error', 'Por favor completa todos los campos');
            return;
        }
        
        if (!termsAccepted) {
            showAlert('error', 'Debes aceptar los términos y condiciones');
            return;
        }
        
        if (password !== confirmPassword) {
            showAlert('error', 'Las contraseñas no coinciden');
            return;
        }
        
        const validation = validatePasswordStrength(password);
        if (!validation.isValid) {
            showAlert('error', validation.message);
            return;
        }
        
        showLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                showAlert('error', data.message || 'Error en el registro');
                return;
            }
            
            // Registro exitoso
            showAlert('success', 'Registro exitoso. Por favor verifica tu email.');
            loginSection.classList.remove('d-none');
            registerSection.classList.add('d-none');
            loginForm.reset();
            registerForm.reset();
            
        } catch (error) {
            showAlert('error', 'Error de conexión. Intenta nuevamente.');
            console.error('Registration error:', error);
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Maneja el restablecimiento de contraseña
     */
    async function handlePasswordReset() {
        const email = document.getElementById('reset-email').value.trim();
        
        if (!email) {
            showAlert('error', 'Por favor ingresa tu email');
            return;
        }
        
        showLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                showAlert('error', data.message || 'Error al solicitar restablecimiento');
                return;
            }
            
            // Solicitud exitosa (aunque no revelemos si el email existe)
            showAlert('success', 'Si el email existe, recibirás un enlace para restablecer tu contraseña');
            passwordResetForm.reset();
            
        } catch (error) {
            showAlert('error', 'Error de conexión. Intenta nuevamente.');
            console.error('Password reset error:', error);
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Maneja la verificación 2FA
     */
    async function handleTwoFactorVerification() {
        const code = document.getElementById('two-factor-code').value.trim();
        
        if (!code || code.length !== 6) {
            showAlert('error', 'Por favor ingresa un código válido de 6 dígitos');
            return;
        }
        
        showLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/verify-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                showAlert('error', data.message || 'Código 2FA inválido');
                return;
            }
            
            // Verificación exitosa
            setAuthCookies(data.token, true);
            authState.currentUser = data.user;
            redirectToDashboard();
            
        } catch (error) {
            showAlert('error', 'Error de conexión. Intenta nuevamente.');
            console.error('2FA error:', error);
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Maneja el logout
     */
    async function handleLogout() {
        try {
            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getCookie('auth_token')}`
                }
            });
            
            if (response.ok) {
                clearAuthCookies();
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    /**
     * Maneja un login fallido
     */
    function handleFailedLogin(message) {
        showAlert('error', message);
        
        // Bloquear temporalmente después de 3 intentos fallidos
        if (authState.loginAttempts >= 3) {
            showAlert('error', 'Demasiados intentos fallidos. Por favor espera 5 minutos antes de intentar nuevamente.');
            disableLoginForm(300); // 5 minutos
        }
    }
    
    /**
     * Deshabilita temporalmente el formulario de login
     */
    function disableLoginForm(seconds) {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        let remaining = seconds;
        const timerInterval = setInterval(() => {
            submitBtn.textContent = `Intentar nuevamente en ${remaining}s`;
            remaining--;
            
            if (remaining < 0) {
                clearInterval(timerInterval);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Iniciar Sesión';
            }
        }, 1000);
    }
    
    /**
     * Valida la fortaleza de la contraseña
     */
    function validatePasswordStrength(password) {
        const result = { isValid: true, message: '' };
        
        if (password.length < MIN_PASSWORD_LENGTH) {
            result.isValid = false;
            result.message = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
            return result;
        }
        
        if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
            result.isValid = false;
            result.message = 'La contraseña debe contener al menos una mayúscula';
            return result;
        }
        
        if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
            result.isValid = false;
            result.message = 'La contraseña debe contener al menos una minúscula';
            return result;
        }
        
        if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
            result.isValid = false;
            result.message = 'La contraseña debe contener al menos un número';
            return result;
        }
        
        if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
            result.isValid = false;
            result.message = 'La contraseña debe contener al menos un carácter especial';
            return result;
        }
        
        return result;
    }
    
    /**
     * Muestra la sección 2FA
     */
    function show2FASection() {
        loginSection.classList.add('d-none');
        registerSection.classList.add('d-none');
        resetSection.classList.add('d-none');
        twoFactorSection.classList.remove('d-none');
        document.getElementById('two-factor-code').focus();
    }
    
    /**
     * Muestra el setup de 2FA
     */
    function show2FASetup(qrCodeUrl) {
        const setupSection = document.getElementById('two-factor-setup-section');
        const qrCodeImage = document.getElementById('two-factor-qrcode');
        
        qrCodeImage.src = qrCodeUrl;
        setupSection.classList.remove('d-none');
        
        // Copiar clave al portapapeles
        document.getElementById('copy-2fa-secret').addEventListener('click', function() {
            const secret = document.getElementById('two-factor-secret').textContent;
            navigator.clipboard.writeText(secret)
                .then(() => showAlert('success', 'Clave copiada al portapapeles'))
                .catch(err => console.error('Error al copiar:', err));
        });
    }
    
    /**
     * Redirige al dashboard
     */
    function redirectToDashboard() {
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
        window.location.href = redirectUrl;
    }
    
    /**
     * Verifica los parámetros de la URL
     */
    function checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        
        // Verificación de email
        if (params.has('verify')) {
            verifyEmail(params.get('verify'));
        }
        
        // Restablecimiento de contraseña
        if (params.has('reset-token')) {
            showPasswordResetForm(params.get('reset-token'));
        }
        
        // Cierre de sesión
        if (params.has('logout')) {
            handleLogout();
        }
        
        // Sesión expirada
        if (params.has('session-expired')) {
            showSessionExpiredModal();
        }
    }
    
    /**
     * Verifica un token de email
     */
    async function verifyEmail(token) {
        showLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showAlert('success', 'Email verificado correctamente. Ahora puedes iniciar sesión.');
            } else {
                showAlert('error', data.message || 'Error al verificar el email');
            }
            
        } catch (error) {
            showAlert('error', 'Error de conexión. Intenta nuevamente.');
            console.error('Email verification error:', error);
        } finally {
            showLoading(false);
            // Limpiar el parámetro de la URL
            const url = new URL(window.location.href);
            url.searchParams.delete('verify');
            window.history.replaceState({}, document.title, url.toString());
        }
    }
    
    /**
     * Muestra el formulario de restablecimiento de contraseña
     */
    function showPasswordResetForm(token) {
        // Implementar lógica para mostrar el formulario y manejar el envío
        // Puedes reutilizar la sección de reset con campos adicionales
        console.log('Token de restablecimiento:', token);
    }
    
    /**
     * Muestra el modal de sesión expirada
     */
    function showSessionExpiredModal() {
        if (sessionExpiredModal) {
            sessionExpiredModal.classList.add('show');
            sessionExpiredModal.style.display = 'block';
            document.body.classList.add('modal-open');
            
            // Limpiar el parámetro de la URL
            const url = new URL(window.location.href);
            url.searchParams.delete('session-expired');
            window.history.replaceState({}, document.title, url.toString());
        }
    }
    
    /**
     * Valida un token JWT
     */
    async function validateToken(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/validate-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Token inválido');
            }
            
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Establece las cookies de autenticación
     */
    function setAuthCookies(token, rememberMe) {
        const expiryDays = rememberMe ? 30 : 1;
        setCookie('auth_token', token, expiryDays);
        setCookie('is_authenticated', 'true', expiryDays);
    }
    
    /**
     * Limpia las cookies de autenticación
     */
    function clearAuthCookies() {
        deleteCookie('auth_token');
        deleteCookie('is_authenticated');
    }
    
    // ===========================
    // Funciones de utilidad
    // ===========================
    
    function showAlert(type, message) {
        const alertBox = document.createElement('div');
        alertBox.className = `alert alert-${type} alert-dismissible fade show`;
        alertBox.role = 'alert';
        alertBox.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.getElementById('alerts-container');
        container.prepend(alertBox);
        
        setTimeout(() => {
            alertBox.classList.remove('show');
            setTimeout(() => alertBox.remove(), 150);
        }, 5000);
    }
    
    function showLoading(show) {
        const buttons = document.querySelectorAll('button[type="submit"]');
        buttons.forEach(button => {
            button.disabled = show;
            const loader = button.querySelector('.spinner-border') || 
                document.createElement('span');
                
            if (show) {
                loader.className = 'spinner-border spinner-border-sm me-2';
                loader.setAttribute('role', 'status');
                loader.setAttribute('aria-hidden', 'true');
                button.prepend(loader);
            } else {
                if (loader.parentNode === button) {
                    loader.remove();
                }
            }
        });
    }
    
    function showError(input, errorElement, message) {
        input.classList.add('is-invalid');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    function clearError(input, errorElement) {
        input.classList.remove('is-invalid');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
    
    function clearFormErrors(form) {
        if (!form) return;
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        form.querySelectorAll('.invalid-feedback').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    }
    
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
    
    function deleteCookie(name) {
        document.cookie = `${name}=; Max-Age=-99999999; path=/`;
    }
    
    // Temporizador de inactividad
    let idleTimer;
    
    function startIdleTimer() {
        const idleTimeout = 30 * 60 * 1000; // 30 minutos
        
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            authState.isSessionExpired = true;
            showSessionExpiredModal();
        }, idleTimeout);
    }
    
    function resetIdleTimer() {
        if (authState.currentUser) {
            startIdleTimer();
        }
    }
});
