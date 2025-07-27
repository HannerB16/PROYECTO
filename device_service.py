# device_service.py

from models import Dispositivo
from database import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime


class DeviceService:

    def registrar_dispositivo(self, usuario_id, nombre_dispositivo, navegador, ip, ubicacion):
        """
        Registra un nuevo dispositivo para el usuario si no existe ya.
        """
        try:
            if self.existe_dispositivo(usuario_id, nombre_dispositivo, navegador, ip):
                return None  # Ya está registrado

            nuevo_dispositivo = Dispositivo(
                usuario_id=usuario_id,
                nombre_dispositivo=nombre_dispositivo,
                navegador=navegador,
                ip=ip,
                ubicacion=ubicacion,
                fecha_registro=datetime.utcnow(),
                ultimo_acceso=datetime.utcnow(),
                reconocido=False
            )
            db.session.add(nuevo_dispositivo)
            db.session.commit()
            return nuevo_dispositivo

        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error al registrar dispositivo: {str(e)}")

    def existe_dispositivo(self, usuario_id, nombre_dispositivo, navegador, ip):
        """
        Verifica si un dispositivo ya existe para este usuario.
        """
        return Dispositivo.query.filter_by(
            usuario_id=usuario_id,
            nombre_dispositivo=nombre_dispositivo,
            navegador=navegador,
            ip=ip
        ).first() is not None

    def listar_dispositivos_por_usuario(self, usuario_id):
        """
        Devuelve una lista de dispositivos registrados por un usuario.
        """
        dispositivos = Dispositivo.query.filter_by(usuario_id=usuario_id).all()
        return [self.serializar_dispositivo(d) for d in dispositivos]

    def marcar_como_reconocido(self, dispositivo_id):
        """
        Marca un dispositivo como reconocido (aprobado).
        """
        try:
            dispositivo = Dispositivo.query.get(dispositivo_id)
            if not dispositivo:
                raise ValueError("Dispositivo no encontrado.")
            dispositivo.reconocido = True
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error al actualizar dispositivo: {str(e)}")

    def eliminar_dispositivo(self, dispositivo_id):
        """
        Elimina un dispositivo del usuario.
        """
        try:
            dispositivo = Dispositivo.query.get(dispositivo_id)
            if not dispositivo:
                raise ValueError("Dispositivo no encontrado.")
            db.session.delete(dispositivo)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error al eliminar dispositivo: {str(e)}")

    def actualizar_ultimo_acceso(self, dispositivo_id):
        """
        Actualiza el campo 'último_acceso' al momento actual.
        """
        try:
            dispositivo = Dispositivo.query.get(dispositivo_id)
            if not dispositivo:
                raise ValueError("Dispositivo no encontrado.")
            dispositivo.ultimo_acceso = datetime.utcnow()
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error al actualizar acceso: {str(e)}")

    def serializar_dispositivo(self, dispositivo):
        return {
            'id': dispositivo.id,
            'nombre_dispositivo': dispositivo.nombre_dispositivo,
            'navegador': dispositivo.navegador,
            'ip': dispositivo.ip,
            'ubicacion': dispositivo.ubicacion,
            'fecha_registro': dispositivo.fecha_registro.isoformat(),
            'ultimo_acceso': dispositivo.ultimo_acceso.isoformat() if dispositivo.ultimo_acceso else None,
            'reconocido': dispositivo.reconocido
        }


# Instancia lista para usar en controladores
device_service = DeviceService()
