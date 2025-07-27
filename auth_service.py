# auth_service.py

from models import Usuario
from database import db
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm.exc import NoResultFound
from security import hash_password, verify_password, is_strong_password, generate_jwt
from datetime import datetime


class AuthService:

    def registrar_usuario(self, correo, contraseña, nombre, rol='usuario'):
        """
        Registra un nuevo usuario si el correo no está en uso y la contraseña es válida.
        """
        try:
            if Usuario.query.filter_by(correo=correo).first():
                raise ValueError("El correo ya está registrado.")

            if not is_strong_password(contraseña):
                raise ValueError("La contraseña no cumple con los requisitos de seguridad.")

            nuevo_usuario = Usuario(
                correo=correo,
                contraseña_hash=hash_password(contraseña),
                nombre=nombre,
                rol=rol,
                verificado=False,
                fecha_creacion=datetime.utcnow()
            )

            db.session.add(nuevo_usuario)
            db.session.commit()

            return nuevo_usuario

        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error al registrar el usuario: {str(e)}")

    def autenticar_usuario(self, correo, contraseña):
        """
        Valida las credenciales de inicio de sesión y devuelve un JWT si son correctas.
        """
        try:
            usuario = Usuario.query.filter_by(correo=correo).first()

            if not usuario:
                raise ValueError("Correo no registrado.")
            if not verify_password(contraseña, usuario.contraseña_hash):
                raise ValueError("Contraseña incorrecta.")

            token = generate_jwt({
                "user_id": usuario.id,
                "rol": usuario.rol,
                "correo": usuario.correo
            })

            return token, usuario

        except SQLAlchemyError as e:
            raise Exception(f"Error en la autenticación: {str(e)}")

    def verificar_credenciales(self, correo, contraseña):
        """
        Devuelve True si el correo y contraseña son válidos.
        """
        usuario = Usuario.query.filter_by(correo=correo).first()
        if not usuario:
            return False
        return verify_password(contraseña, usuario.contraseña_hash)

    def obtener_usuario_por_correo(self, correo):
        """
        Retorna un objeto Usuario por correo, si existe.
        """
        return Usuario.query.filter_by(correo=correo).first()

    def marcar_como_verificado(self, usuario_id):
        """
        Marca el campo `verificado` como True para un usuario.
        """
        try:
            usuario = Usuario.query.get(usuario_id)
            if not usuario:
                raise ValueError("Usuario no encontrado.")
            usuario.verificado = True
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error al verificar cuenta: {str(e)}")


# Instancia lista para usar en controladores
auth_service = AuthService()
