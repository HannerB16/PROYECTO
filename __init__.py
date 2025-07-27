# FileName: /Proyecto_Pagina_Web/Backend/services/__init__.py

"""
Módulo de servicios: expone instancias globales de cada servicio para su uso en app.py u otros módulos.
"""

from .admin_service import admin_service
from .auth_service import auth_service
from .device_service import device_service
from .log_service import log_service
from .notification_service import notification_service
from .password_service import password_service
from .session_service import session_service
from .validation_service import validation_service

# Otros servicios (si los agregas) deben exponerse aquí también
