// FileName: /Proyecto_Pagina_Web/Backend/static/JS/device_script.js
document.addEventListener('DOMContentLoaded', function() {
    // Configuración global
    const config = {
        apiBaseUrl: '/api/devices',
        itemsPerPage: 10,
        currentPage: 1,
        currentSort: { field: 'lastActive', order: 'desc' },
        currentFilters: {}
    };

    // Elementos del DOM
    const elements = {
        tableBody: document.getElementById('devices-table-body'),
        paginationContainer: document.getElementById('devices-pagination'),
        filterForm: document.getElementById('devices-filter-form'),
        statusMessage: document.getElementById('devices-status-message'),
        loadingIndicator: document.getElementById('devices-loading-indicator'),
        deviceDetailModal: document.getElementById('device-detail-modal'),
        revokeModal: document.getElementById('revoke-device-modal')
    };

    // Estado de la aplicación
    let state = {
        selectedDevice: null,
        selectedDevices: [],
        isProcessing: false
    };

    // Inicialización
    initDeviceManager();

    /**
     * Inicializa el gestor de dispositivos
     */
    function initDeviceManager() {
        loadDevices();
        setupEventListeners();
        setupTooltips();
    }

    /**
     * Configura los event listeners
     */
    function setupEventListeners() {
        // Filtros y búsqueda
        if (elements.filterForm) {
            elements.filterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                applyFilters();
            });
        }

        // Paginación
        if (elements.paginationContainer) {
            elements.paginationContainer.addEventListener('click', function(e) {
                if (e.target.classList.contains('page-link')) {
                    e.preventDefault();
                    const page = parseInt(e.target.getAttribute('data-page'));
                    if (!isNaN(page)) {
                        changePage(page);
                    }
                }
            });
        }

        // Event delegation para acciones de dispositivo
        elements.tableBody.addEventListener('click', function(e) {
            const actionBtn = e.target.closest('button');
            if (!actionBtn) return;

            const deviceId = actionBtn.closest('tr').getAttribute('data-device-id');

            if (actionBtn.classList.contains('view-device-btn')) {
                showDeviceDetails(deviceId);
            } else if (actionBtn.classList.contains('revoke-device-btn')) {
                showRevokeConfirmation(deviceId);
            }
        });

        // Confirmar revocación
        const confirmRevokeBtn = document.getElementById('confirm-revoke-btn');
        if (confirmRevokeBtn) {
            confirmRevokeBtn.addEventListener('click', performRevoke);
        }

        // Bulk actions
        const bulkActionBtn = document.getElementById('devices-bulk-action');
        if (bulkActionBtn) {
            bulkActionBtn.addEventListener('click', performBulkAction);
        }

        // Selección múltiple
        document.addEventListener('change', function(e) {
            if (e.target.classList.contains('device-checkbox')) {
                const deviceId = e.target.value;
                if (e.target.checked) {
                    state.selectedDevices.push(deviceId);
                } else {
                    state.selectedDevices = state.selectedDevices.filter(id => id !== deviceId);
                }
                toggleBulkActions();
            }
        });

        // Seleccionar/deseleccionar todos
        const selectAllCheckbox = document.getElementById('select-all-devices');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', function(e) {
                const checkboxes = document.querySelectorAll('.device-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    checkbox.dispatchEvent(new Event('change'));
                });
            });
        }
    }

    /**
     * Configura tooltips
     */
    function setupTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    /**
     * Carga dispositivos desde la API
     */
    function loadDevices() {
        showLoading(true);
        state.isProcessing = true;

        const queryParams = new URLSearchParams({
            page: config.currentPage,
            perPage: config.itemsPerPage,
            sortField: config.currentSort.field,
            sortOrder: config.currentSort.order,
            ...config.currentFilters
        });

        fetch(`${config.apiBaseUrl}?${queryParams}`)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar dispositivos');
                return response.json();
            })
            .then(data => {
                renderDevicesTable(data.devices);
                renderPagination(data.totalItems);
                showStatusMessage(`Mostrando ${data.devices.length} de ${data.totalItems} dispositivos`, 'success');
                updateDeviceCounts(data.stats);
            })
            .catch(error => {
                showStatusMessage(error.message, 'error');
                console.error('Error:', error);
            })
            .finally(() => {
                showLoading(false);
                state.isProcessing = false;
            });
    }

    /**
     * Renderiza la tabla de dispositivos
     */
    function renderDevicesTable(devices) {
        elements.tableBody.innerHTML = '';
        
        if (devices.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="8" class="text-center py-4">No se encontraron dispositivos</td>`;
            elements.tableBody.appendChild(row);
            return;
        }
        
        devices.forEach(device => {
            const row = document.createElement('tr');
            row.setAttribute('data-device-id', device.id);
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="device-checkbox form-check-input" value="${device.id}">
                </td>
                <td>${device.deviceType || 'Desconocido'}</td>
                <td>
                    <span class="badge ${device.isCurrent ? 'bg-primary' : 'bg-secondary'}">
                        ${device.isCurrent ? 'Actual' : 'Otro'}
                    </span>
                </td>
                <td>${device.browser || 'N/A'}</td>
                <td>${device.os || 'N/A'}</td>
                <td>${device.ipAddress || 'N/A'}</td>
                <td>
                    ${device.lastActive ? 
                        new Date(device.lastActive).toLocaleString() : 
                        'Nunca'}
                </td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary view-device-btn" 
                                data-bs-toggle="tooltip" 
                                title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${device.isCurrent ? '' : `
                        <button class="btn btn-sm btn-outline-danger revoke-device-btn" 
                                data-bs-toggle="tooltip" 
                                title="Revocar acceso">
                            <i class="bi bi-trash"></i>
                        </button>
                        `}
                    </div>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
        
        // Re-inicializar tooltips para los nuevos elementos
        setupTooltips();
    }

    /**
     * Renderiza la paginación
     */
    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / config.itemsPerPage);
        elements.paginationContainer.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Botón Anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${config.currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `
            <a class="page-link" href="#" data-page="${config.currentPage - 1}">
                <span>&laquo;</span>
            </a>
        `;
        elements.paginationContainer.appendChild(prevLi);
        
        // Páginas
        const startPage = Math.max(1, config.currentPage - 2);
        const endPage = Math.min(totalPages, config.currentPage + 2);
        
        if (startPage > 1) {
            const li = document.createElement('li');
            li.className = 'page-item';
            li.innerHTML = `<a class="page-link" href="#" data-page="1">1</a>`;
            elements.paginationContainer.appendChild(li);
            if (startPage > 2) {
                const dots = document.createElement('li');
                dots.className = 'page-item disabled';
                dots.innerHTML = `<span class="page-link">...</span>`;
                elements.paginationContainer.appendChild(dots);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${config.currentPage === i ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            elements.paginationContainer.appendChild(li);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dots = document.createElement('li');
                dots.className = 'page-item disabled';
                dots.innerHTML = `<span class="page-link">...</span>`;
                elements.paginationContainer.appendChild(dots);
            }
            const li = document.createElement('li');
            li.className = 'page-item';
            li.innerHTML = `<a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>`;
            elements.paginationContainer.appendChild(li);
        }
        
        // Botón Siguiente
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${config.currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `
            <a class="page-link" href="#" data-page="${config.currentPage + 1}">
                <span>&raquo;</span>
            </a>
        `;
        elements.paginationContainer.appendChild(nextLi);
    }

    /**
     * Muestra los detalles de un dispositivo
     */
    function showDeviceDetails(deviceId) {
        state.selectedDevice = deviceId;
        showLoading(true);
        
        fetch(`${config.apiBaseUrl}/${deviceId}`)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar detalles');
                return response.json();
            })
            .then(device => {
                const modalBody = elements.deviceDetailModal.querySelector('.modal-body');
                modalBody.innerHTML = `
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Tipo de dispositivo:</div>
                        <div class="col-md-8">${device.deviceType || 'Desconocido'}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Navegador:</div>
                        <div class="col-md-8">${device.browser || 'N/A'}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Sistema Operativo:</div>
                        <div class="col-md-8">${device.os || 'N/A'}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Dirección IP:</div>
                        <div class="col-md-8">${device.ipAddress || 'N/A'}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Ubicación:</div>
                        <div class="col-md-8">
                            ${device.location ? `${device.location.city || ''} ${device.location.country || ''}` : 'N/A'}
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Primer acceso:</div>
                        <div class="col-md-8">${new Date(device.firstSeen).toLocaleString()}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Último acceso:</div>
                        <div class="col-md-8">${new Date(device.lastActive).toLocaleString()}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Estado:</div>
                        <div class="col-md-8">
                            <span class="badge ${device.isCurrent ? 'bg-primary' : 'bg-secondary'}">
                                ${device.isCurrent ? 'Dispositivo actual' : 'Otro dispositivo'}
                            </span>
                        </div>
                    </div>
                `;
                
                const modal = new bootstrap.Modal(elements.deviceDetailModal);
                modal.show();
            })
            .catch(error => {
                showStatusMessage(error.message, 'error');
                console.error('Error:', error);
            })
            .finally(() => {
                showLoading(false);
            });
    }

    /**
     * Muestra el modal de confirmación para revocar dispositivo
     */
    function showRevokeConfirmation(deviceId) {
        state.selectedDevice = deviceId;
        const modal = new bootstrap.Modal(elements.revokeModal);
        modal.show();
    }

    /**
     * Ejecuta la revocación del dispositivo
     */
    function performRevoke() {
        if (!state.selectedDevice) return;
        
        showLoading(true);
        state.isProcessing = true;
        
        fetch(`${config.apiBaseUrl}/${state.selectedDevice}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al revocar dispositivo');
            return response.json();
        })
        .then(() => {
            showStatusMessage('Dispositivo revocado correctamente', 'success');
            loadDevices();
            const modal = bootstrap.Modal.getInstance(elements.revokeModal);
            modal.hide();
        })
        .catch(error => {
            showStatusMessage(error.message, 'error');
            console.error('Error:', error);
        })
        .finally(() => {
            showLoading(false);
            state.isProcessing = false;
            state.selectedDevice = null;
        });
    }

    /**
     * Aplica los filtros seleccionados
     */
    function applyFilters() {
        const formData = new FormData(elements.filterForm);
        config.currentFilters = {
            deviceType: formData.get('deviceType'),
            status: formData.get('status'),
            dateFrom: formData.get('dateFrom'),
            dateTo: formData.get('dateTo')
        };
        
        config.currentPage = 1;
        loadDevices();
    }

    /**
     * Cambia la página actual
     */
    function changePage(page) {
        config.currentPage = page;
        loadDevices();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Habilita/deshabilita acciones masivas
     */
    function toggleBulkActions() {
        const bulkActionBtn = document.getElementById('devices-bulk-action');
        if (bulkActionBtn) {
            bulkActionBtn.disabled = state.selectedDevices.length === 0;
        }
    }

    /**
     * Ejecuta acciones masivas sobre dispositivos seleccionados
     */
    function performBulkAction() {
        if (state.selectedDevices.length === 0 || state.isProcessing) return;
        
        const action = document.getElementById('devices-bulk-action-select').value;
        if (!action) return;
        
        if (!confirm(`¿Estás seguro de querer ${action} ${state.selectedDevices.length} dispositivos?`)) {
            return;
        }
        
        showLoading(true);
        state.isProcessing = true;
        
        fetch(`${config.apiBaseUrl}/bulk-actions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deviceIds: state.selectedDevices,
                action: action
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en acción masiva');
            return response.json();
        })
        .then(data => {
            showStatusMessage(`Acción masiva completada (${data.affected} dispositivos)`, 'success');
            state.selectedDevices = [];
            document.getElementById('select-all-devices').checked = false;
            loadDevices();
        })
        .catch(error => {
            showStatusMessage(error.message, 'error');
            console.error('Error:', error);
        })
        .finally(() => {
            showLoading(false);
            state.isProcessing = false;
        });
    }

    /**
     * Actualiza los contadores de dispositivos
     */
    function updateDeviceCounts(stats) {
        document.querySelectorAll('.total-devices-count').forEach(el => {
            el.textContent = stats.total;
        });
        document.querySelectorAll('.active-devices-count').forEach(el => {
            el.textContent = stats.active;
        });
    }

    /**
     * Muestra un mensaje de estado
     */
    function showStatusMessage(message, type) {
        if (!elements.statusMessage) return;
        
        elements.statusMessage.textContent = message;
        elements.statusMessage.className = `alert alert-${type} alert-dismissible fade show`;
        elements.statusMessage.style.display = 'block';
        
        setTimeout(() => {
            if (elements.statusMessage) {
                elements.statusMessage.style.opacity = '0';
                setTimeout(() => {
                    if (elements.statusMessage) {
                        elements.statusMessage.style.display = 'none';
                        elements.statusMessage.style.opacity = '1';
                    }
                }, 500);
            }
        }, 5000);
    }

    /**
     * Muestra/oculta el indicador de carga
     */
    function showLoading(show) {
        if (elements.loadingIndicator) {
            elements.loadingIndicator.style.display = show ? 'block' : 'none';
        }
        
        const actionButtons = document.querySelectorAll('.device-action-btn');
        actionButtons.forEach(btn => {
            btn.disabled = show;
        });
        
        const bulkActionBtn = document.getElementById('devices-bulk-action');
        if (bulkActionBtn) {
            bulkActionBtn.disabled = show || state.selectedDevices.length === 0;
        }
    }
});
