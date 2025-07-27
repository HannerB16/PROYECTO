# user_service.py

from models import Usuario
from database import db
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm.exc import NoResultFound


class UserService:

    def obtener_usuario_por_id(self, usuario_id):
        """
        Devuelve un objeto Usuario por su ID.
        """
        return Usuario.query.get(usuario_id)

    def obtener_usuario_por_correo(self, correo):
        """
        Devuelve un objeto Usuario por correo.
        """
        return Usuario.query.filter_by(correo=correo).first()

    def actualizar_datos_usuario(self, usuario_id, nuevo_nombre=None, nuevo_correo=None):
        """
        Actualiza el nombre y/o correo del usuario.
        """
        try:
            usuario = Usuario.query.get(usuario_id)
            if not usuario:
                raise ValueError("Usuario no encontrado.")

            if nuevo_nombre:
                usuario.nombre = nuevo_nombre
            if nuevo_correo:
                # Verificar que no esté en uso por otro
                if Usuario.query.filter(Usuario.correo == nuevo_correo, Usuario.id != usuario_id).first():
                    raise ValueError("El correo ya está en uso por otro usuario.")
                usuario.correo = nuevo_correo

            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error actualizando usuario: {str(e)}")

    def activar_usuario(self, usuario_id):
        """
        Marca al usuario como verificado manualmente.
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
            raise Exception(f"Error activando usuario: {str(e)}")

    def existe_correo(self, correo):
        """
        Verifica si un correo ya está registrado.
        """
        return Usuario.query.filter_by(correo=correo).first() is not None

    def serializar_usuario(self, usuario):
        """
        Retorna un dict con info visible para frontend.
        """
        return {
            'id': usuario.id,
            'nombre': usuario.nombre,
            'correo': usuario.correo,
            'rol': usuario.rol,
            'verificado': usuario.verificado,
            'fecha_creacion': usuario.fecha_creacion.isoformat()
        }


# Instancia lista para usar
user_service = UserService()
