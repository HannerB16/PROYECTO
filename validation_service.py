import re
from utils.password_utils import is_strong_password
from models import User
from extensions import db
from sqlalchemy.exc import SQLAlchemyError
from services.log_service import log_service

class ValidationService:

    def is_valid_email(self, email: str) -> bool:
        """
        Valida formato de correo electrónico.
        """
        regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        return re.match(regex, email) is not None

    def is_valid_username(self, username: str) -> bool:
        """
        Valida que el nombre de usuario tenga letras, números y guiones bajos, y una longitud razonable.
        """
        return re.match(r'^[a-zA-Z0-9_]{4,20}$', username) is not None

    def validate_registration_data(self, username: str, email: str, password: str):
        """
        Valida los datos de registro (sintaxis y existencia en BD).
        """
        if not self.is_valid_username(username):
            return {"error": "Nombre de usuario inválido. Usa solo letras, números o _ y mínimo 4 caracteres."}, 400

        if not self.is_valid_email(email):
            return {"error": "Formato de correo electrónico inválido."}, 400

        if not is_strong_password(password):
            return {"error": "La contraseña no cumple con los criterios de seguridad."}, 400

        try:
            if User.query.filter_by(username=username).first():
                return {"error": "El nombre de usuario ya está en uso."}, 400

            if User.query.filter_by(email=email).first():
                return {"error": "El correo electrónico ya está en uso."}, 400

        except SQLAlchemyError as e:
            log_service.log_error("Error validando usuario existente", str(e))
            return {"error": "Error interno del servidor"}, 500

        return None  # Todo OK

    def validate_login_data(self, email: str, password: str):
        """
        Valida formato mínimo del login.
        """
        if not email or not password:
            return {"error": "Email y contraseña son requeridos"}, 400

        if not self.is_valid_email(email):
            return {"error": "Formato de email inválido"}, 400

        if len(password) < 6:
            return {"error": "La contraseña es demasiado corta"}, 400

        return None  # Todo OK

# Instancia global
validation_service = ValidationService()
