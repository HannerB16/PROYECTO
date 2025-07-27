// FileName: /Proyecto_Pagina_Web/Backend/static/JS/admin_script.js
document.addEventListener('DOMContentLoaded', function() {
    // Configuración global
    const config = {
        apiBaseUrl: '/api/admin',
        itemsPerPage: 10,
        currentPage: 1,
        currentSort: { field: 'id', order: 'asc' },
        currentFilters: {}
    };

    // Elementos del DOM
    const elements = {
        usersTable: document.getElementById('users-table'),
        usersTableBody: document.getElementById('users-table-body'),
        logsTable: document.getElementById('logs-table'),
        logsTableBody: document.getElementById('logs-table-body'),
        paginationContainer: document.getElementById('pagination-container'),
        filterForm: document.getElementById('admin-filters'),
        searchInput: document.getElementById('admin-search'),
        bulkActionsSelect: document.getElementById('bulk-actions'),
        applyBulkActionBtn: document.getElementById('apply-bulk-action'),
        statusMessage: document.getElementById('admin-status-message'),
        editUserModal: document.getElementById('edit-user-modal'),
        viewUserModal: document.getElementById('view-user-modal'),
        viewLogModal: document.getElementById('view-log-modal')
    };

    // Inicialización
    initAdminPanel();

    /**
     * Inicializa el panel de administración
     */
    function initAdminPanel() {
        loadUsers();
        loadLogs();
        setupEventListeners();
    }

    /**
     * Configura los event listeners
     */
    function setupEventListeners() {
        // Filtros y búsqueda
        elements.filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyFilters();
        });

        elements.searchInput.addEventListener('keyup', debounce(function() {
            applyFilters();
        }, 500));

        // Paginación
        elements.paginationContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('page-item')) {
                const page = parseInt(e.target.getAttribute('data-page'));
                if (!isNaN(page)) {
                    changePage(page);
                }
            }
        });

        // Acciones masivas
        elements.applyBulkActionBtn.addEventListener('click', function() {
            const selectedIds = getSelectedUserIds();
            const action = elements.bulkActionsSelect.value;
            
            if (selectedIds.length === 0) {
                showStatusMessage('Selecciona al menos un usuario', 'error');
                return;
            }

            if (action === '0') {
                showStatusMessage('Selecciona una acción válida', 'error');
                return;
            }

            performBulkAction(selectedIds, action);
        });

        // Ordenamiento de columnas
        document.querySelectorAll('.sortable-column').forEach(col => {
            col.addEventListener('click', function() {
                const field = this.getAttribute('data-field');
                const currentOrder = config.currentSort.field === field ? 
                    (config.currentSort.order === 'asc' ? 'desc' : 'asc') : 'asc';
                
                config.currentSort = { field, order: currentOrder };
                updateSortIndicator(this, currentOrder);
                loadUsers();
            });
        });

        // Modales
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('view-user-btn')) {
                showUserDetailsModal(e.target.getAttribute('data-userid'));
            }
            
            if (e.target.classList.contains('edit-user-btn')) {
                showEditUserModal(e.target.getAttribute('data-userid'));
            }
            
            if (e.target.classList.contains('view-log-btn')) {
                showLogDetailsModal(e.target.getAttribute('data-logid'));
            }
            
            if (e.target.classList.contains('close-modal')) {
                closeAllModals();
            }
        });

        // Delegación de eventos para botones de acción rápida
        elements.usersTableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-activate')) {
                toggleUserStatus(e.target.closest('tr').getAttribute('data-userid'), true);
            }
            
            if (e.target.classList.contains('btn-deactivate')) {
                toggleUserStatus(e.target.closest('tr').getAttribute('data-userid'), false);
            }
            
            if (e.target.classList.contains('btn-delete')) {
                confirmAndDeleteUser(e.target.closest('tr').getAttribute('data-userid'));
            }
        });
    }

    /**
     * Carga usuarios desde la API
     */
    function loadUsers() {
        showLoadingState(true);
        
        const queryParams = new URLSearchParams({
            page: config.currentPage,
            items: config.itemsPerPage,
            sortField: config.currentSort.field,
            sortOrder: config.currentSort.order,
            search: config.currentFilters.search || '',
            status: config.currentFilters.status || '',
            role: config.currentFilters.role || '',
            dateFrom: config.currentFilters.dateFrom || '',
            dateTo: config.currentFilters.dateTo || ''
        });

        fetch(`${config.apiBaseUrl}/users?${queryParams}`)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar usuarios');
                return response.json();
            })
            .then(data => {
                renderUsersTable(data.users);
                renderPagination(data.totalItems);
                showStatusMessage(`Mostrando ${data.users.length} de ${data.totalItems} usuarios`, 'success');
            })
            .catch(error => {
                showStatusMessage(error.message, 'error');
                console.error('Error:', error);
            })
            .finally(() => {
                showLoadingState(false);
            });
    }

    /**
     * Carga logs desde la API
     */
    function loadLogs() {
        fetch(`${config.apiBaseUrl}/logs`)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar logs');
                return response.json();
            })
            .then(data => {
                renderLogsTable(data.logs);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    /**
     * Renderiza la tabla de usuarios
     */
    function renderUsersTable(users) {
        elements.usersTableBody.innerHTML = '';
        
        if (users.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="9" class="text-center">No se encontraron usuarios</td>`;
            elements.usersTableBody.appendChild(row);
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.setAttribute('data-userid', user.id);
            
            row.innerHTML = `
                <td><input type="checkbox" class="user-checkbox" value="${user.id}"></td>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}">${user.role}</span></td>
                <td><span class="badge ${user.status ? 'bg-success' : 'bg-secondary'}">${user.status ? 'Activo' : 'Inactivo'}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>${user.loginCount || 0}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-user-btn" data-userid="${user.id}">Ver</button>
                    <button class="btn btn-sm btn-outline-warning edit-user-btn" data-userid="${user.id}">Editar</button>
                    <button class="btn btn-sm ${user.status ? 'btn-outline-secondary btn-activate' : 'btn-outline-success btn-deactivate'}">
                        ${user.status ? 'Desactivar' : 'Activar'}
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete">Eliminar</button>
                </td>
            `;
            
            elements.usersTableBody.appendChild(row);
        });
    }

    /**
     * Renderiza la tabla de logs
     */
    function renderLogsTable(logs) {
        elements.logsTableBody.innerHTML = '';
        
        if (logs.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7" class="text-center">No se encontraron logs</td>`;
            elements.logsTableBody.appendChild(row);
            return;
        }
        
        logs.slice(0, 10).forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.id}</td>
                <td>${log.type}</td>
                <td>${log.userId || 'Sistema'}</td>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.ip || 'N/A'}</td>
                <td>${log.message.substring(0, 50)}${log.message.length > 50 ? '...' : ''}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-log-btn" data-logid="${log.id}">Detalles</button>
                </td>
            `;
            
            elements.logsTableBody.appendChild(row);
        });
    }

    /**
     * Renderiza la paginación
     */
    function renderPagination(totalItems) {
        const pageCount = Math.ceil(totalItems / config.itemsPerPage);
        
        if (pageCount <= 1) {
            elements.paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = `
            <li class="page-item ${config.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${config.currentPage - 1}">Anterior</a>
            </li>
        `;
        
        for (let i = 1; i <= pageCount; i++) {
            paginationHTML += `
                <li class="page-item ${config.currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        paginationHTML += `
            <li class="page-item ${config.currentPage === pageCount ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${config.currentPage + 1}">Siguiente</a>
            </li>
        `;
        
        elements.paginationContainer.innerHTML = paginationHTML;
    }

    /**
     * Aplica filtros a la tabla de usuarios
     */
    function applyFilters() {
        const formData = new FormData(elements.filterForm);
        
        config.currentFilters = {
            search: elements.searchInput.value.trim(),
            status: formData.get('status'),
            role: formData.get('role'),
            dateFrom: formData.get('dateFrom'),
            dateTo: formData.get('dateTo')
        };
        
        config.currentPage = 1;
        loadUsers();
    }

    /**
     * Cambia la página actual
     */
    function changePage(page) {
        config.currentPage = page;
        loadUsers();
    }

    /**
     * Obtiene IDs de usuarios seleccionados
     */
    function getSelectedUserIds() {
        const checkboxes = document.querySelectorAll('.user-checkbox:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    /**
     * Ejecuta acción masiva sobre usuarios seleccionados
     */
    function performBulkAction(userIds, action) {
        if (!confirm(`¿Estás seguro de querer ${getActionName(action)} a ${userIds.length} usuarios?`)) {
            return;
        }
        
        showLoadingState(true);
        
        fetch(`${config.apiBaseUrl}/bulk-actions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userIds,
                action
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al ejecutar acción masiva');
            return response.json();
        })
        .then(data => {
            showStatusMessage(`Acción masiva aplicada a ${data.affected} usuarios`, 'success');
            loadUsers();
        })
        .catch(error => {
            showStatusMessage(error.message, 'error');
            console.error('Error:', error);
        })
        .finally(() => {
            showLoadingState(false);
        });
    }

    /**
     * Muestra modal con detalles de usuario
     */
    function showUserDetailsModal(userId) {
        fetch(`${config.apiBaseUrl}/users/${userId}`)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar detalles del usuario');
                return response.json();
            })
            .then(user => {
                const modalContent = elements.viewUserModal.querySelector('.modal-body');
                
                modalContent.innerHTML = `
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">ID:</div>
                        <div class="col-md-8">${user.id}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Nombre:</div>
                        <div class="col-md-8">${user.name}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Email:</div>
                        <div class="col-md-8">${user.email}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Rol:</div>
                        <div class="col-md-8"><span class="badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}">${user.role}</span></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Estado:</div>
                        <div class="col-md-8"><span class="badge ${user.status ? 'bg-success' : 'bg-secondary'}">${user.status ? 'Activo' : 'Inactivo'}</span></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Fecha de creación:</div>
                        <div class="col-md-8">${new Date(user.createdAt).toLocaleString()}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Último acceso:</div>
                        <div class="col-md-8">${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Dispositivos:</div>
                        <div class="col-md-8">${user.deviceCount || 0} registrados</div>
                    </div>
                `;
                
                showModal(elements.viewUserModal);
            })
            .catch(error => {
                showStatusMessage(error.message, 'error');
                console.error('Error:', error);
            });
    }

    /**
     * Muestra modal para editar usuario
     */
    function showEditUserModal(userId) {
        fetch(`${config.apiBaseUrl}/users/${userId}`)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar datos del usuario');
                return response.json();
            })
            .then(user => {
                const modalForm = elements.editUserModal.querySelector('form');
                modalForm.setAttribute('data-userid', user.id);
                
                modalForm.querySelector('#edit-name').value = user.name;
                modalForm.querySelector('#edit-email').value = user.email;
                modalForm.querySelector('#edit-role').value = user.role;
                modalForm.querySelector('#edit-status').checked = user.status;
                
                showModal(elements.editUserModal);
            })
            .catch(error => {
                showStatusMessage(error.message, 'error');
                console.error('Error:', error);
            });
    }

    /**
     * Muestra modal con detalles de log
     */
    function showLogDetailsModal(logId) {
        fetch(`${config.apiBaseUrl}/logs/${logId}`)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar detalles del log');
                return response.json();
            })
            .then(log => {
                const modalContent = elements.viewLogModal.querySelector('.modal-body');
                
                modalContent.innerHTML = `
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">ID:</div>
                        <div class="col-md-8">${log.id}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Tipo:</div>
                        <div class="col-md-8">${log.type}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Usuario:</div>
                        <div class="col-md-8">${log.userId || 'Sistema'}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Fecha/Hora:</div>
                        <div class="col-md-8">${new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">IP:</div>
                        <div class="col-md-8">${log.ip || 'N/A'}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Mensaje:</div>
                        <div class="col-md-8">${log.message}</div>
                    </div>
                `;
                
                showModal(elements.viewLogModal);
            })
            .catch(error => {
                showStatusMessage(error.message, 'error');
                console.error('Error:', error);
            });
    }

    /**
     * Cambia el estado de un usuario
     */
    function toggleUserStatus(userId, activate) {
        const action = activate ? 'activate' : 'deactivate';
        
        if (!confirm(`¿Estás seguro de querer ${activate ? 'activar' : 'desactivar'} este usuario?`)) {
            return;
        }
        
        fetch(`${config.apiBaseUrl}/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: activate })
        })
        .then(response => {
            if (!response.ok) throw new Error(`Error al ${action} usuario`);
            return response.json();
        })
        .then(() => {
            showStatusMessage(`Usuario ${activate ? 'activado' : 'desactivado'} correctamente`, 'success');
            loadUsers();
        })
        .catch(error => {
            showStatusMessage(error.message, 'error');
            console.error('Error:', error);
        });
    }

    /**
     * Confirma y elimina un usuario
     */
    function confirmAndDeleteUser(userId) {
        if (!confirm('¿Estás seguro de querer eliminar este usuario? Esta acción no se puede deshacer.')) {
            return;
        }
        
        fetch(`${config.apiBaseUrl}/users/${userId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al eliminar usuario');
            return response.json();
        })
        .then(() => {
            showStatusMessage('Usuario eliminado correctamente', 'success');
            loadUsers();
        })
        .catch(error => {
            showStatusMessage(error.message, 'error');
            console.error('Error:', error);
        });
    }

    /**
     * Muestra un modal
     */
    function showModal(modalElement) {
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        document.body.classList.add('modal-open');
        
        const backdrop = document.createElement('div');
        backdrop.classList.add('modal-backdrop', 'fade', 'show');
        document.body.appendChild(backdrop);
    }

    /**
     * Cierra todos los modals
     */
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
            modal.style.display = 'none';
        });
        
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
    }

    /**
     * Actualiza el indicador de ordenamiento
     */
    function updateSortIndicator(columnElement, order) {
        document.querySelectorAll('.sortable-column').forEach(col => {
            col.querySelector('.sort-indicator').innerHTML = '';
        });
        
        columnElement.querySelector('.sort-indicator').innerHTML = 
            order === 'asc' ? '↑' : '↓';
    }

    /**
     * Muestra mensaje de estado
     */
    function showStatusMessage(message, type) {
        elements.statusMessage.textContent = message;
        elements.statusMessage.className = `alert alert-${type}`;
        elements.statusMessage.style.display = 'block';
        
        setTimeout(() => {
            elements.statusMessage.style.display = 'none';
        }, 5000);
    }

    /**
     * Muestra/oculta estado de carga
     */
    function showLoadingState(show) {
        const loader = document.getElementById('loading-indicator');
        if (show) {
            loader.style.display = 'block';
        } else {
            loader.style.display = 'none';
        }
    }

    /**
     * Devuelve el nombre descriptivo de una acción
     */
    function getActionName(actionValue) {
        const actions = {
            'activate': 'activar',
            'deactivate': 'desactivar',
            'delete': 'eliminar',
            'promote': 'promover a admin',
            'demote': 'degradar a usuario'
        };
        
        return actions[actionValue] || actionValue;
    }

    /**
     * Función debounce para limitar frecuencia de ejecución
     */
    function debounce(func, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // Manejo del formulario de edición de usuario
    document.getElementById('edit-user-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const userId = this.getAttribute('data-userid');
        
        fetch(`${config.apiBaseUrl}/users/${userId}`, {
            method: 'PUT',
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al actualizar usuario');
            return response.json();
        })
        .then(() => {
            showStatusMessage('Usuario actualizado correctamente', 'success');
            loadUsers();
            closeAllModals();
        })
        .catch(error => {
            showStatusMessage(error.message, 'error');
            console.error('Error:', error);
        });
    });
});
