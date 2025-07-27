document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registroForm');
    const submitButton = registroForm ? registroForm.querySelector('button[type="submit"]') : null;

    if (registroForm) {
        registroForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita el envío tradicional del formulario

            // 1. Validación del lado del cliente
            if (!validateForm()) {
                return; // Si la validación falla, detiene el proceso
            }

            const formData = new FormData(registroForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // 2. Indicador de carga
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Registrando...';
            }

            try {
                // CORRECCIÓN: Asegúrate de que esta URL sea la correcta para tu backend Flask.
                // Si tu ruta POST en Flask es '/auth/registro', déjala así.
                // Si tu ruta POST en Flask es '/registro', cámbiala a '/registro'.
                const response = await fetch('/registro', { // Asumiendo que '/registro' es la ruta correcta
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Registro exitoso:', result);
                    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
                    registroForm.reset(); // Limpia el formulario
                    // Opcional: Redirigir al usuario
                    // window.location.href = '/login';
                } else {
                    const errorData = await response.json();
                    console.error('Error en el registro:', errorData);
                    displayErrorMessage(errorData.message || 'Error desconocido al registrarse.');
                }
            } catch (error) {
                console.error('Error de red o del servidor:', error);
                displayErrorMessage('Ocurrió un error de conexión. Por favor, inténtalo de nuevo.');
            } finally {
                // Restablecer el botón de envío
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Registrarse';
                }
            }
        });
    } else {
        console.error("Error: No se encontró el formulario con el ID 'registroForm'. Asegúrate de que tu HTML tenga <form id='registroForm'>...</form>");
    }

    // --- Funciones de ayuda para la validación y UI ---

    function validateForm() {
        let isValid = true;
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm_password'); // Asumiendo que tienes este campo

        // Limpiar mensajes de error previos
        clearErrorMessages();

        // Validación de nombre de usuario
        if (!usernameInput || usernameInput.value.trim() === '') {
            displayFieldError(usernameInput, 'El nombre de usuario es obligatorio.');
            isValid = false;
        }

        // Validación de email
        if (!emailInput || emailInput.value.trim() === '') {
            displayFieldError(emailInput, 'El email es obligatorio.');
            isValid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            displayFieldError(emailInput, 'Por favor, introduce un email válido.');
            isValid = false;
        }

        // Validación de contraseña
        if (!passwordInput || passwordInput.value.trim() === '') {
            displayFieldError(passwordInput, 'La contraseña es obligatoria.');
            isValid = false;
        } else if (passwordInput.value.trim().length < 6) { // Ejemplo: mínimo 6 caracteres
            displayFieldError(passwordInput, 'La contraseña debe tener al menos 6 caracteres.');
            isValid = false;
        }

        // Validación de confirmación de contraseña
        if (confirmPasswordInput) {
            if (confirmPasswordInput.value.trim() === '') {
                displayFieldError(confirmPasswordInput, 'Confirma tu contraseña.');
                isValid = false;
            } else if (passwordInput && passwordInput.value !== confirmPasswordInput.value) {
                displayFieldError(confirmPasswordInput, 'Las contraseñas no coinciden.');
                isValid = false;
            }
        }

        return isValid;
    }

    function isValidEmail(email) {
        // Expresión regular simple para validar email
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function displayFieldError(inputElement, message) {
        if (!inputElement) return;
        inputElement.classList.add('is-invalid'); // Clase para resaltar el campo (ej. Bootstrap)
        let errorDiv = inputElement.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
            errorDiv = document.createElement('div');
            errorDiv.classList.add('invalid-feedback'); // Clase para el mensaje de error
            inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block'; // Asegurarse de que sea visible
    }

    function clearErrorMessages() {
        document.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        document.querySelectorAll('.invalid-feedback').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        const generalErrorDiv = document.getElementById('general-error-message');
        if (generalErrorDiv) {
            generalErrorDiv.textContent = '';
            generalErrorDiv.style.display = 'none';
        }
    }

    function displayErrorMessage(message) {
        let generalErrorDiv = document.getElementById('general-error-message');
        if (!generalErrorDiv) {
            generalErrorDiv = document.createElement('div');
            generalErrorDiv.id = 'general-error-message';
            generalErrorDiv.classList.add('alert', 'alert-danger', 'mt-3'); // Clases para un mensaje de error general
            registroForm.parentNode.insertBefore(generalErrorDiv, registroForm.nextSibling);
        }
        generalErrorDiv.textContent = message;
        generalErrorDiv.style.display = 'block';
    }
});
