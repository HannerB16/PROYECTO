# session_service.py

from models import Sesion, Dispositivo
from database import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime


class SessionService:

    def registrar_sesion(self, usuario_id, ip, tipo_acceso, exito=True, dispositivo_id=None):
        """
        Registra una nueva sesión (exitosa o fallida).
        """
        try:
            nueva_sesion = Sesion(
                usuario_id=usuario_id,
                dispositivo_id=dispositivo_id,
                ip=ip,
                tipo_acceso=tipo_acceso,
                exito=exito,
                fecha_inicio=datetime.utcnow()
            )
            db.session.add(nueva_sesion)
            db.session.commit()
            return nueva_sesion
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error al registrar sesión: {str(e)}")

    def cerrar_sesion(self, sesion_id):
        """
        Marca la hora de cierre de una sesión.
        """
        try:
            sesion = Sesion.query.get(sesion_id)
            if not sesion:
                raise ValueError("Sesión no encontrada.")
            sesion.fecha_cierre = datetime.utcnow()
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error al cerrar sesión: {str(e)}")

    def obtener_sesiones_por_usuario(self, usuario_id, limite=20):
        """
        Devuelve el historial de sesiones más recientes del usuario.
        """
        sesiones = (
            Sesion.query
            .filter_by(usuario_id=usuario_id)
            .order_by(Sesion.fecha_inicio.desc())
            .limit(limite)
            .all()
        )
        return [self.serializar_sesion(s) for s in sesiones]

    def obtener_sesion_activa(self, usuario_id):
        """
        Devuelve la última sesión activa sin cerrar, si existe.
        """
        return (
            Sesion.query
            .filter_by(usuario_id=usuario_id, fecha_cierre=None)
            .order_by(Sesion.fecha_inicio.desc())
            .first()
        )

    def serializar_sesion(self, sesion):
        return {
            'id': sesion.id,
            'ip': sesion.ip,
            'tipo_acceso': sesion.tipo_acceso,
            'fecha_inicio': sesion.fecha_inicio.isoformat(),
            'fecha_cierre': sesion.fecha_cierre.isoformat() if sesion.fecha_cierre else None,
            'exito': sesion.exito,
            'dispositivo': sesion.dispositivo.nombre_dispositivo if sesion.dispositivo else None
        }


# Instancia lista para usar
session_service = SessionService()
