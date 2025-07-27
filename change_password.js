// FileName: /Proyecto_Pagina_Web/Backend/static/JS/change_password.js
document.addEventListener('DOMContentLoaded', function() {
    // Configuración
    const API_URL = '/api/auth/change-password';
    const MIN_PASSWORD_LENGTH = 8;
    const PASSWORD_REQUIREMENTS = {
        minLength: MIN_PASSWORD_LENGTH,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true
    };

    // Elementos del DOM
    const form = document.getElementById('change-password-form');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStrengthMeter = document.getElementById('password-strength-meter');
    const passwordStrengthText = document.getElementById('password-strength-text');
    const passwordRequirementsList = document.getElementById('password-requirements');
    const showCurrentPasswordBtn = document.getElementById('show-current-password');
    const showNewPasswordBtn = document.getElementById('show-new-password');
    const showConfirmPasswordBtn = document.getElementById('show-confirm-password');
    const submitBtn = document.getElementById('change-password-btn');
    const statusMessage = document.getElementById('status-message');

    // Inicialización
    setupEventListeners();
    renderPasswordRequirements();

    /**
     * Configura los event listeners
     */
    function setupEventListeners() {
        // Validación en tiempo real
        newPasswordInput.addEventListener('input', function() {
            validatePasswordStrength(this.value);
            checkPasswordMatch();
        });

        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
        currentPasswordInput.addEventListener('input', clearValidation);

        // Mostrar/ocultar contraseñas
        if (showCurrentPasswordBtn) {
            showCurrentPasswordBtn.addEventListener('click', function() {
                togglePasswordVisibility(currentPasswordInput, this);
            });
        }

        if (showNewPasswordBtn) {
            showNewPasswordBtn.addEventListener('click', function() {
                togglePasswordVisibility(newPasswordInput, this);
            });
        }

        if (showConfirmPasswordBtn) {
            showConfirmPasswordBtn.addEventListener('click', function() {
                togglePasswordVisibility(confirmPasswordInput, this);
            });
        }

        // Envío del formulario
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePasswordChange();
        });
    }

    /**
     * Maneja el cambio de contraseña
     */
    function handlePasswordChange() {
        // Validación final antes de enviar
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showStatusMessage('Por favor completa todos los campos', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showStatusMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        const validation = validatePasswordStrength(newPassword, true);
        if (!validation.isValid) {
            showStatusMessage(validation.message, 'error');
            return;
        }

        // Mostrar loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';

        // Enviar solicitud
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('auth_token')}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            showStatusMessage(data.message || 'Contraseña cambiada exitosamente', 'success');
            form.reset();
            resetPasswordStrengthMeter();
            
            // Opcional: Cerrar sesión después de cambiar contraseña
            if (data.logoutRequired) {
                setTimeout(() => {
                    window.location.href = '/logout?reason=password_changed';
                }, 2000);
            }
        })
        .catch(error => {
            showStatusMessage(error.message || 'Error al cambiar la contraseña', 'error');
            
            // Manejar intentos fallidos
            if (error.remainingAttempts !== undefined) {
                if (error.remainingAttempts <= 0) {
                    showStatusMessage('Cuenta bloqueada temporalmente. Intenta más tarde.', 'error');
                    currentPasswordInput.disabled = true;
                    submitBtn.disabled = true;
                } else {
                    showStatusMessage(`${error.message} (Intentos restantes: ${error.remainingAttempts})`, 'error');
                }
            }
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Cambiar Contraseña';
        });
    }

    /**
     * Valida la fortaleza de la contraseña
     */
    function validatePasswordStrength(password, fullValidation = false) {
        const result = {
            isValid: true,
            message: '',
            strength: 0
        };

        // Longitud mínima
        if (password.length < PASSWORD_REQUIREMENTS.minLength) {
            if (fullValidation) {
                result.isValid = false;
                result.message = `La contraseña debe tener al menos ${PASSWORD_REQUIREMENTS.minLength} caracteres`;
            }
            updatePasswordStrengthMeter(0);
            return result;
        }

        let strength = 0;
        
        // Requisitos básicos
        if (PASSWORD_REQUIREMENTS.requireUppercase && /[A-Z]/.test(password)) strength++;
        if (PASSWORD_REQUIREMENTS.requireLowercase && /[a-z]/.test(password)) strength++;
        if (PASSWORD_REQUIREMENTS.requireNumber && /[0-9]/.test(password)) strength++;
        if (PASSWORD_REQUIREMENTS.requireSpecialChar && /[^A-Za-z0-9]/.test(password)) strength++;
        
        // Longitud adicional
        if (password.length >= 12) strength++;
        if (password.length >= 16) strength++;
        
        // Verificar si cumple con todos los requisitos para fullValidation
        if (fullValidation) {
            const missingRequirements = [];
            
            if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
                missingRequirements.push('una mayúscula');
            }
            
            if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
                missingRequirements.push('una minúscula');
            }
            
            if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
                missingRequirements.push('un número');
            }
            
            if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
                missingRequirements.push('un carácter especial');
            }
            
            if (missingRequirements.length > 0) {
                result.isValid = false;
                result.message = `La contraseña debe contener ${missingRequirements.join(', ')}`;
            }
        }
        
        // Actualizar medidor visual
        updatePasswordStrengthMeter(strength);
        
        result.strength = strength;
        return result;
    }

    /**
     * Actualiza el medidor visual de fortaleza de contraseña
     */
    function updatePasswordStrengthMeter(strength) {
        // Resetear primero
        passwordStrengthMeter.value = 0;
        passwordStrengthText.textContent = '';
        passwordStrengthMeter.className = 'form-range';
        
        if (strength <= 0) return;
        
        // Configurar según fuerza
        let meterValue = 0;
        let meterClass = '';
        let strengthText = '';
        
        if (strength <= 2) {
            meterValue = 33;
            meterClass = 'weak';
            strengthText = 'Débil';
        } else if (strength <= 4) {
            meterValue = 66;
            meterClass = 'medium';
            strengthText = 'Moderada';
        } else {
            meterValue = 100;
            meterClass = 'strong';
            strengthText = 'Fuerte';
        }
        
        passwordStrengthMeter.value = meterValue;
        passwordStrengthMeter.classList.add(meterClass);
        passwordStrengthText.textContent = strengthText;
    }

    /**
     * Reinicia el medidor de fortaleza
     */
    function resetPasswordStrengthMeter() {
        passwordStrengthMeter.value = 0;
        passwordStrengthText.textContent = '';
        passwordStrengthMeter.className = 'form-range';
    }

    /**
     * Verifica que las contraseñas coincidan
     */
    function checkPasswordMatch() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!newPassword || !confirmPassword) return;
        
        if (newPassword !== confirmPassword) {
            confirmPasswordInput.classList.add('is-invalid');
            document.getElementById('confirm-password-error').textContent = 'Las contraseñas no coinciden';
        } else {
            confirmPasswordInput.classList.remove('is-invalid');
            document.getElementById('confirm-password-error').textContent = '';
        }
    }

    /**
     * Limpia las validaciones
     */
    function clearValidation() {
        currentPasswordInput.classList.remove('is-invalid');
        document.getElementById('current-password-error').textContent = '';
    }

    /**
     * Muestra un mensaje de estado
     */
    function showStatusMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `alert alert-${type}`;
        statusMessage.style.display = 'block';
        
        // Desvanecer después de 5 segundos
        setTimeout(() => {
            statusMessage.style.opacity = '0';
            setTimeout(() => {
                statusMessage.style.display = 'none';
                statusMessage.style.opacity = '1';
            }, 500);
        }, 5000);
    }

    /**
     * Alternar visibilidad de contraseña
     */
    function togglePasswordVisibility(input, button) {
        const isShowing = input.type === 'text';
        input.type = isShowing ? 'password' : 'text';
        button.innerHTML = isShowing ? 
            '<i class="bi bi-eye"></i>' : 
            '<i class="bi bi-eye-slash"></i>';
    }

    /**
     * Renderiza los requisitos de contraseña
     */
    function renderPasswordRequirements() {
        if (!passwordRequirementsList) return;
        
        passwordRequirementsList.innerHTML = '';
        
        const requirements = [
            { text: `Mínimo ${PASSWORD_REQUIREMENTS.minLength} caracteres`, test: (p) => p.length >= PASSWORD_REQUIREMENTS.minLength },
            { text: 'Al menos una letra mayúscula', test: (p) => PASSWORD_REQUIREMENTS.requireUppercase ? /[A-Z]/.test(p) : true },
            { text: 'Al menos una letra minúscula', test: (p) => PASSWORD_REQUIREMENTS.requireLowercase ? /[a-z]/.test(p) : true },
            { text: 'Al menos un número', test: (p) => PASSWORD_REQUIREMENTS.requireNumber ? /[0-9]/.test(p) : true },
            { text: 'Al menos un carácter especial', test: (p) => PASSWORD_REQUIREMENTS.requireSpecialChar ? /[^A-Za-z0-9]/.test(p) : true }
        ];
        
        requirements.forEach(req => {
            const li = document.createElement('li');
            li.textContent = req.text;
            li.classList.add('password-requirement');
            passwordRequirementsList.appendChild(li);
        });
        
        // Actualizar en tiempo real
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            const items = passwordRequirementsList.querySelectorAll('li');
            
            requirements.forEach((req, index) => {
                if (password) {
                    items[index].classList.toggle('requirement-met', req.test(password));
                } else {
                    items[index].classList.remove('requirement-met');
                }
            });
        });
    }

    /**
     * Obtiene una cookie por nombre
     */
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});
