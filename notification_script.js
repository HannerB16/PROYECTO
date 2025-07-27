// FileName: /Proyecto_Pagina_Web/Backend/static/JS/notification_script.js
document.addEventListener('DOMContentLoaded', function() {
    // Configuración global
    const config = {
        apiBaseUrl: '/api/notifications',
        itemsPerPage: 10,
        currentPage: 1,
        pollingInterval: 30000, // 30 segundos
        unreadCheckInterval: 10000, // 10 segundos
        realtimeEnabled: true,
        soundEnabled: true,
        notificationSound: '/static/sounds/notification.mp3'
    };

    // Elementos del DOM
    const elements = {
        notificationsContainer: document.getElementById('notifications-container'),
        unreadCount: document.getElementById('unread-count'),
        markAllReadBtn: document.getElementById('mark-all-read'),
        notificationPreferencesBtn: document.getElementById('notification-preferences'),
        notificationDropdown: document.getElementById('notification-dropdown'),
        loadMoreBtn: document.getElementById('load-more-notifications'),
        notificationSound: document.getElementById('notification-sound'),
        realtimeToggle: document.getElementById('realtime-toggle'),
        soundToggle: document.getElementById('sound-toggle')
    };

    // Estado de la aplicación
    const state = {
        notifications: [],
        unreadNotifications: 0,
        isLoading: false,
        hasMore: true,
        websocket: null,
        notificationCheckInterval: null,
        lastChecked: null
    };

    // Inicialización
    initNotifications();

    /**
     * Inicializa el sistema de notificaciones
     */
    function initNotifications() {
        loadNotifications();
        setupEventListeners();
        setupWebSocket();
        startUnreadCheck();
        restorePreferences();
    }

    /**
     * Configura los event listeners
     */
    function setupEventListeners() {
        // Botones de acción
        if (elements.markAllReadBtn) {
            elements.markAllReadBtn.addEventListener('click', markAllAsRead);
        }

        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.addEventListener('click', loadMoreNotifications);
        }

        if (elements.notificationPreferencesBtn) {
            elements.notificationPreferencesBtn.addEventListener('click', showPreferencesModal);
        }

        // Event delegation para acciones de notificación
        if (elements.notificationsContainer) {
            elements.notificationsContainer.addEventListener('click', function(e) {
                const target = e.target.closest('[data-notification-id]');
                if (target) {
                    const notificationId = target.getAttribute('data-notification-id');
                    if (e.target.classList.contains('mark-as-read')) {
                        markAsRead(notificationId);
                    } else if (e.target.classList.contains('delete-notification')) {
                        deleteNotification(notificationId);
                    } else {
                        viewNotification(notificationId);
                    }
                }
            });
        }

        // Toggles de preferencias
        if (elements.realtimeToggle) {
            elements.realtimeToggle.addEventListener('change', function() {
                config.realtimeEnabled = this.checked;
                savePreferences();
                if (config.realtimeEnabled) {
                    setupWebSocket();
                } else {
                    disconnectWebSocket();
                }
            });
        }

        if (elements.soundToggle) {
            elements.soundToggle.addEventListener('change', function() {
                config.soundEnabled = this.checked;
                savePreferences();
            });
        }

        // Evento para notificaciones push del navegador
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                checkNewNotifications();
            }
        });
    }

    /**
     * Restaura las preferencias guardadas
     */
    function restorePreferences() {
        const savedPrefs = localStorage.getItem('notificationPreferences');
        if (savedPrefs) {
            const prefs = JSON.parse(savedPrefs);
            config.realtimeEnabled = prefs.realtimeEnabled !== false;
            config.soundEnabled = prefs.soundEnabled !== false;

            if (elements.realtimeToggle) {
                elements.realtimeToggle.checked = config.realtimeEnabled;
            }
            if (elements.soundToggle) {
                elements.soundToggle.checked = config.soundEnabled;
            }
        }
    }

    /**
     * Guarda las preferencias del usuario
     */
    function savePreferences() {
        const prefs = {
            realtimeEnabled: config.realtimeEnabled,
            soundEnabled: config.soundEnabled
        };
        localStorage.setItem('notificationPreferences', JSON.stringify(prefs));
    }

    /**
     * Configura la conexión WebSocket
     */
    function setupWebSocket() {
        if (!config.realtimeEnabled || state.websocket) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsUrl = `${wsProtocol}${window.location.host}/ws/notifications`;
        
        state.websocket = new WebSocket(wsUrl);

        state.websocket.onopen = function() {
            console.log('Conexión WebSocket establecida');
        };

        state.websocket.onmessage = function(event) {
            const message = JSON.parse(event.data);
            if (message.type === 'new_notification') {
                handleNewNotification(message.data);
            }
        };

        state.websocket.onclose = function() {
            console.log('Conexión WebSocket cerrada');
            // Reconexión después de 5 segundos
            setTimeout(setupWebSocket, 5000);
        };

        state.websocket.onerror = function(error) {
            console.error('Error en WebSocket:', error);
        };
    }

    /**
     * Desconecta el WebSocket
     */
    function disconnectWebSocket() {
        if (state.websocket) {
            state.websocket.close();
            state.websocket = null;
        }
    }

    /**
     * Inicia la verificación periódica de notificaciones no leídas
     */
    function startUnreadCheck() {
        state.notificationCheckInterval = setInterval(checkNewNotifications, config.unreadCheckInterval);
    }

    /**
     * Verifica nuevas notificaciones no leídas
     */
    function checkNewNotifications() {
        if (state.isLoading) return;

        const lastChecked = state.lastChecked || new Date().toISOString();
        
        fetch(`${config.apiBaseUrl}/unread?since=${lastChecked}`)
            .then(response => response.json())
            .then(data => {
                state.lastChecked = new Date().toISOString();
                
                if (data.count > 0) {
                    updateUnreadCount(data.count);
                    
                    if (data.count > state.unreadNotifications) {
                        // Hay nuevas notificaciones desde la última verificación
                        playNotificationSound();
                        showDesktopNotification(data.count);
                    }
                    
                    if (document.hidden || !config.realtimeEnabled) {
                        // Si la pestaña no está activa o realtime está desactivado
                        loadLatestNotifications();
                    }
                }
                
                state.unreadNotifications = data.count;
            })
            .catch(error => {
                console.error('Error al verificar notificaciones:', error);
            });
    }

    /**
     * Carga las notificaciones
     */
    function loadNotifications() {
        if (state.isLoading) return;
        
        state.isLoading = true;
        showLoading(true);
        
        fetch(`${config.apiBaseUrl}?page=${config.currentPage}&per_page=${config.itemsPerPage}`)
            .then(response => response.json())
            .then(data => {
                state.notifications = data.notifications;
                state.unreadNotifications = data.unreadCount;
                state.hasMore = data.hasMore;
                
                renderNotifications();
                updateUnreadCount(data.unreadCount);
                
                if (data.unreadCount > 0) {
                    // Mostrar notificación si hay no leídas
                    playNotificationSound();
                }
            })
            .catch(error => {
                console.error('Error al cargar notificaciones:', error);
                showErrorMessage('No se pudieron cargar las notificaciones');
            })
            .finally(() => {
                state.isLoading = false;
                showLoading(false);
            });
    }

    /**
     * Carga notificaciones más recientes
     */
    function loadLatestNotifications() {
        fetch(`${config.apiBaseUrl}?latest=true&limit=5`)
            .then(response => response.json())
            .then(data => {
                if (data.notifications.length > 0) {
                    prependNotifications(data.notifications);
                }
            })
            .catch(error => {
                console.error('Error al cargar últimas notificaciones:', error);
            });
    }

    /**
     * Carga más notificaciones (paginación)
     */
    function loadMoreNotifications() {
        if (state.isLoading || !state.hasMore) return;
        
        config.currentPage++;
        state.isLoading = true;
        elements.loadMoreBtn.disabled = true;
        elements.loadMoreBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Cargando...';
        
        fetch(`${config.apiBaseUrl}?page=${config.currentPage}&per_page=${config.itemsPerPage}`)
            .then(response => response.json())
            .then(data => {
                state.notifications = [...state.notifications, ...data.notifications];
                state.hasMore = data.hasMore;
                
                appendNotifications(data.notifications);
            })
            .catch(error => {
                console.error('Error al cargar más notificaciones:', error);
                showErrorMessage('No se pudieron cargar más notificaciones');
                config.currentPage--;
            })
            .finally(() => {
                state.isLoading = false;
                if (state.hasMore) {
                    elements.loadMoreBtn.disabled = false;
                    elements.loadMoreBtn.textContent = 'Cargar más';
                } else {
                    elements.loadMoreBtn.style.display = 'none';
                }
            });
    }

    /**
     * Maneja una nueva notificación en tiempo real
     */
    function handleNewNotification(notification) {
        if (!Array.isArray(notification)) {
            notification = [notification];
        }
        
        prependNotifications(notification);
        updateUnreadCount(state.unreadNotifications + notification.length);
        
        // Solo reproducir sonido y mostrar alerta si no es la pestaña activa
        if (document.hidden || elements.notificationDropdown.classList.contains('show')) {
            playNotificationSound();
            showDesktopNotification(notification.length);
        }
    }

    /**
     * Renderiza las notificaciones
     */
    function renderNotifications() {
        if (!elements.notificationsContainer) return;
        
        elements.notificationsContainer.innerHTML = '';
        state.notifications.forEach(notification => {
            elements.notificationsContainer.appendChild(createNotificationElement(notification));
        });
        
        if (state.hasMore && !elements.loadMoreBtn) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.id = 'load-more-notifications';
            loadMoreBtn.className = 'btn btn-link w-100 text-center';
            loadMoreBtn.textContent = 'Cargar más';
            loadMoreBtn.addEventListener('click', loadMoreNotifications);
            elements.notificationsContainer.appendChild(loadMoreBtn);
        }
    }

    /**
     * Añade notificaciones al final del listado
     */
    function appendNotifications(notifications) {
        notifications.forEach(notification => {
            elements.notificationsContainer.appendChild(createNotificationElement(notification));
        });
    }

    /**
     * Añade notificaciones al inicio del listado
     */
    function prependNotifications(notifications) {
        const fragment = document.createDocumentFragment();
        notifications.reverse().forEach(notification => {
            fragment.prepend(createNotificationElement(notification));
        });
        
        elements.notificationsContainer.prepend(fragment);
    }

    /**
     * Crea un elemento de notificación
     */
    function createNotificationElement(notification) {
        const notifElement = document.createElement('div');
        notifElement.className = `notification-item ${notification.read ? '' : 'unread'}`;
        notifElement.setAttribute('data-notification-id', notification.id);
        
        const notifContent = `
            <div class="notification-content">
                <div class="notification-icon bg-${notification.type}">
                    <i class="${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-details">
                    <h6 class="notification-title">${notification.title}</h6>
                    <p class="notification-message">${truncate(notification.message, 100)}</p>
                    <small class="notification-time">${formatTimeAgo(notification.createdAt)}</small>
                </div>
                <div class="notification-actions">
                    <button class="btn btn-sm mark-as-read" title="Marcar como leída">
                        <i class="bi bi-check-circle"></i>
                    </button>
                    <button class="btn btn-sm delete-notification" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        notifElement.innerHTML = notifContent;
        return notifElement;
    }

    /**
     * Marca una notificación como leída
     */
    function markAsRead(notificationId) {
        fetch(`${config.apiBaseUrl}/${notificationId}/read`, {
            method: 'PUT'
        })
        .then(response => {
            if (response.ok) {
                const notification = state.notifications.find(n => n.id === notificationId);
                if (notification) {
                    notification.read = true;
                }
                
                document.querySelector(`.notification-item[data-notification-id="${notificationId}"]`).classList.remove('unread');
                
                if (state.unreadNotifications > 0) {
                    updateUnreadCount(state.unreadNotifications - 1);
                }
            }
        })
        .catch(error => {
            console.error('Error al marcar como leída:', error);
        });
    }

    /**
     * Marca todas las notificaciones como leídas
     */
    function markAllAsRead() {
        fetch(`${config.apiBaseUrl}/read-all`, {
            method: 'PUT'
        })
        .then(response => {
            if (response.ok) {
                state.notifications.forEach(notification => {
                    notification.read = true;
                });
                
                document.querySelectorAll('.notification-item.unread').forEach(el => {
                    el.classList.remove('unread');
                });
                
                updateUnreadCount(0);
            }
        })
        .catch(error => {
            console.error('Error al marcar todas como leídas:', error);
            showErrorMessage('No se pudieron marcar todas como leídas');
        });
    }

    /**
     * Elimina una notificación
     */
    function deleteNotification(notificationId) {
        if (!confirm('¿Eliminar esta notificación?')) return;
        
        fetch(`${config.apiBaseUrl}/${notificationId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                // Eliminar del estado
                state.notifications = state.notifications.filter(n => n.id !== notificationId);
                
                // Eliminar del DOM
                const element = document.querySelector(`.notification-item[data-notification-id="${notificationId}"]`);
                if (element) {
                    element.remove();
                }
                
                // Actualizar contador si no estaba leída
                const notification = state.notifications.find(n => n.id === notificationId);
                if (notification && !notification.read && state.unreadNotifications > 0) {
                    updateUnreadCount(state.unreadNotifications - 1);
                }
            }
        })
        .catch(error => {
            console.error('Error al eliminar notificación:', error);
            showErrorMessage('No se pudo eliminar la notificación');
        });
    }

    /**
     * Visualiza una notificación
     */
    function viewNotification(notificationId) {
        const notification = state.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        // Mostrar modal o redirigir según el tipo de notificación
        if (notification.link) {
            window.location.href = notification.link;
        } else {
            // Aquí puedes implementar un modal para mostrar el contenido completo
            showNotificationModal(notification);
        }
        
        // Marcarla como leída automáticamente si no lo está
        if (!notification.read) {
            markAsRead(notificationId);
        }
    }

    /**
     * Muestra el modal de preferencias
     */
    function showPreferencesModal() {
        // Implementar lógica para mostrar un modal con opciones de configuración
        console.log('Mostrar modal de preferencias de notificación');
    }

    /**
     * Actualiza el contador de notificaciones no leídas
     */
    function updateUnreadCount(count) {
        state.unreadNotifications = count;
        
        if (elements.unreadCount) {
            elements.unreadCount.textContent = count > 99 ? '99+' : count;
            elements.unreadCount.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }

    /**
     * Reproduce el sonido de notificación
     */
    function playNotificationSound() {
        if (!config.soundEnabled || !elements.notificationSound) return;
        
        try {
            elements.notificationSound.src = config.notificationSound;
            elements.notificationSound.play().catch(e => {
                console.error('Error al reproducir sonido:', e);
            });
        } catch (error) {
            console.error('Error con el sonido:', error);
        }
    }

    /**
     * Muestra una notificación del sistema
     */
    function showDesktopNotification(count) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        
        const title = count > 1 ? `Tienes ${count} notificaciones nuevas` : 'Tienes una notificación nueva';
        const options = {
            body: count > 1 ? `Hay ${count} notificaciones nuevas en tu cuenta` : 'Haz clic para ver tu notificación',
            icon: '/static/images/notification-icon.png'
        };
        
        new Notification(title, options).onclick = function() {
            window.focus();
        };
    }

    /**
     * Muestra el estado de carga
     */
    function showLoading(show) {
        const loader = document.getElementById('notifications-loading');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Muestra un mensaje de error
     */
    function showErrorMessage(message) {
        const errorElement = document.getElementById('notifications-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * Obtiene el icono correspondiente al tipo de notificación
     */
    function getNotificationIcon(type) {
        const icons = {
            info: 'bi bi-info-circle',
            success: 'bi bi-check-circle',
            warning: 'bi bi-exclamation-triangle',
            error: 'bi bi-x-circle',
            system: 'bi bi-gear',
            message: 'bi bi-chat-left-text'
        };
        return icons[type] || icons.info;
    }

    /**
     * Formatea la fecha como "hace X tiempo"
     */
    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Hace unos segundos';
        if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
        if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
        if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
        return date.toLocaleDateString();
    }

    /**
     * Acorta un texto a la longitud especificada
     */
    function truncate(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    // Solicitar permiso para notificaciones al cargar la página
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            console.log('Permiso de notificación:', permission);
        });
    }
});
