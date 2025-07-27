# password_service.py

from models import Usuario
from database import db
from sqlalchemy.exc import SQLAlchemyError
from security import verify_password, hash_password, is_strong_password
from notification_service import notification_service


class PasswordService:

    def cambiar_contraseña(self, usuario_id, contraseña_actual, nueva_contraseña):
        """
        Cambia la contraseña si la actual es correcta y la nueva es segura.
        """
        try:
            usuario = Usuario.query.get(usuario_id)
            if not usuario:
                raise ValueError("Usuario no encontrado.")

            if not verify_password(contraseña_actual, usuario.contraseña_hash):
                raise ValueError("La contraseña actual es incorrecta.")

            if not is_strong_password(nueva_contraseña):
                raise ValueError("La nueva contraseña no cumple con los requisitos de seguridad.")

            usuario.contraseña_hash = hash_password(nueva_contraseña)
            db.session.commit()

            # Notificación por correo
            notification_service.enviar_cambio_contraseña(usuario)

            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error al cambiar contraseña: {str(e)}")
        except Exception as e:
            raise Exception(str(e))

    def forzar_cambio_contraseña(self, usuario_id, nueva_contraseña):
        """
        Cambia la contraseña sin validar la actual (solo para admin o recuperación).
        """
        try:
            usuario = Usuario.query.get(usuario_id)
            if not usuario:
                raise ValueError("Usuario no encontrado.")

            if not is_strong_password(nueva_contraseña):
                raise ValueError("La nueva contraseña no es suficientemente fuerte.")

            usuario.contraseña_hash = hash_password(nueva_contraseña)
            db.session.commit()

            notification_service.enviar_cambio_contraseña(usuario)

            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error forzando el cambio de contraseña: {str(e)}")
        except Exception as e:
            raise Exception(str(e))


# Instancia global lista para usar
password_service = PasswordService()
