# log_service.py

from database import db
from models import Log, Usuario
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime


class LogService:

    def registrar_log(self, usuario_id, accion, descripcion):
        """
        Registra un evento en el sistema.
        """
        try:
            nuevo_log = Log(
                usuario_id=usuario_id,
                accion=accion,
                descripcion=descripcion,
                timestamp=datetime.utcnow()
            )
            db.session.add(nuevo_log)
            db.session.commit()
            return nuevo_log
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error al registrar log: {str(e)}")

    def obtener_logs_por_usuario(self, usuario_id, limite=50):
        """
        Devuelve los logs recientes para un usuario.
        """
        logs = (
            Log.query
            .filter_by(usuario_id=usuario_id)
            .order_by(Log.timestamp.desc())
            .limit(limite)
            .all()
        )
        return [self.serializar_log(log) for log in logs]

    def obtener_todos_los_logs(self, limite=100):
        """
        Devuelve los logs más recientes del sistema.
        """
        logs = (
            Log.query
            .order_by(Log.timestamp.desc())
            .limit(limite)
            .all()
        )
        return [self.serializar_log(log) for log in logs]

    def serializar_log(self, log):
        return {
            'id': log.id,
            'usuario_id': log.usuario_id,
            'usuario': log.usuario.correo if log.usuario else "Sistema",
            'accion': log.accion,
            'descripcion': log.descripcion,
            'timestamp': log.timestamp.isoformat()
        }


# Instancia lista para usar
log_service = LogService()
