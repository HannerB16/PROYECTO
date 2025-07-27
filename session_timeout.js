// FileName: /Proyecto_Pagina_Web/Backend/static/JS/session_timeout.js
document.addEventListener('DOMContentLoaded', function() {
    // Configuración global
    const config = {
        sessionTimeout: 1800, // 30 minutos en segundos
        warningTime: 300, // 5 minutos en segundos
        checkInterval: 60, // Chequear cada minuto
        logoutUrl: '/logout',
        pingUrl: '/api/session/ping',
        modalId: 'session-timeout-modal',
        warningClass: 'session-warning',
        inactiveClass: 'session-inactive'
    };

    // Variables de estado
    let idleTimer;
    let warningTimer;
    let countdownTimer;
    let lastActivity = new Date();
    let isWarningActive = false;
    let isModalShown = false;

    // Elementos del DOM
    const modalElement = document.getElementById(config.modalId);
    const countdownElement = modalElement ? modalElement.querySelector('.countdown') : null;
    const extendSessionBtn = modalElement ? modalElement.querySelector('.extend-session') : null;

    // Inicialización
    setupEventListeners();
    startSessionTimer();

    /**
     * Configura los event listeners para detectar actividad
     */
    function setupEventListeners() {
        // Eventos de actividad del usuario
        const activityEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, resetTimers, { passive: true });
        });

        // Evento cuando la pestaña gana foco
        window.addEventListener('focus', checkSessionStatus);

        // Evento para extender la sesión
        if (extendSessionBtn) {
            extendSessionBtn.addEventListener('click', extendSession);
        }
    }

    /**
     * Reinicia todos los timers
     */
    function resetTimers() {
        lastActivity = new Date();
        
        if (isWarningActive) {
            resetWarningTimer();
        }

        resetSessionTimer();
        
        // Enviar ping al servidor solo si hay actividad significativa
        if (!isModalShown) {
            pingServer();
        }
    }

    /**
     * Inicia el timer principal de sesión
     */
    function startSessionTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(checkSessionStatus, config.sessionTimeout * 1000);
    }

    /**
     * Reinicia el timer principal de sesión
     */
    function resetSessionTimer() {
        clearTimeout(idleTimer);
        startSessionTimer();
    }

    /**
     * Inicia el timer de advertencia
     */
    function startWarningTimer() {
        warningTimer = setTimeout(showTimeoutWarning, (config.sessionTimeout - config.warningTime) * 1000);
    }

    /**
     * Reinicia el timer de advertencia
     */
    function resetWarningTimer() {
        clearTimeout(warningTimer);
        startWarningTimer();
    }

    /**
     * Verifica el estado de la sesión
     */
    function checkSessionStatus() {
        const now = new Date();
        const idleTime = (now - lastActivity) / 1000; // En segundos
        
        // Si el tiempo de inactividad supera el timeout
        if (idleTime >= config.sessionTimeout) {
            handleSessionTimeout();
        } 
        // Si está cerca de expirar pero no se ha mostrado la advertencia
        else if (idleTime >= (config.sessionTimeout - config.warningTime) && !isWarningActive) {
            showTimeoutWarning();
        }
    }

    /**
     * Muestra la advertencia de timeout
     */
    function showTimeoutWarning() {
        isWarningActive = true;
        
        // Mostrar el modal de advertencia
        if (modalElement) {
            modalElement.classList.add('show');
            modalElement.style.display = 'block';
            document.body.classList.add('modal-open');
            isModalShown = true;
            
            // Iniciar countdown
            startCountdown(config.warningTime);
        }
        
        // Añadir clase de advertencia al body
        document.body.classList.add(config.warningClass);
        
        // Forzar un ping al servidor
        pingServer();
    }

    /**
     * Maneja el timeout de sesión
     */
    function handleSessionTimeout() {
        // Limpiar todos los timers
        clearTimeout(idleTimer);
        clearTimeout(warningTimer);
        clearInterval(countdownTimer);
        
        // Añadir clase de inactividad al body
        document.body.classList.add(config.inactiveClass);
        
        // Redirigir al logout
        window.location.href = config.logoutUrl + '?timeout=1';
    }

    /**
     * Extiende la sesión
     */
    function extendSession() {
        // Resetear el estado
        lastActivity = new Date();
        isWarningActive = false;
        isModalShown = false;
        
        // Ocultar el modal
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Remover clase de advertencia
        document.body.classList.remove(config.warningClass);
        
        // Reiniciar timers
        resetSessionTimer();
        startWarningTimer();
        
        // Enviar ping al servidor
        pingServer();
    }

    /**
     * Inicia el contador regresivo
     */
    function startCountdown(seconds) {
        if (!countdownElement) return;
        
        let remaining = seconds;
        updateCountdownDisplay(remaining);
        
        countdownTimer = setInterval(() => {
            remaining--;
            updateCountdownDisplay(remaining);
            
            if (remaining <= 0) {
                clearInterval(countdownTimer);
                handleSessionTimeout();
            }
        }, 1000);
    }

    /**
     * Actualiza el display del contador
     */
    function updateCountdownDisplay(remaining) {
        if (countdownElement) {
            countdownElement.textContent = `La sesión se cerrará en ${remaining} segundos.`;
        }
    }

    /**
     * Envía un ping al servidor para mantener la sesión activa
     */
    function pingServer() {
        fetch(config.pingUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                console.error('Error al enviar ping al servidor');
            }
        })
        .catch(error => {
            console.error('Error en la conexión al servidor:', error);
        });
    }
});
