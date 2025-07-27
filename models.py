# models.py

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    correo = db.Column(db.String(150), unique=True, nullable=False)
    contraseña_hash = db.Column(db.String(255), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    rol = db.Column(db.String(50), default='usuario')  # 'admin' o 'usuario'
    verificado = db.Column(db.Boolean, default=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    dispositivos = db.relationship('Dispositivo', backref='usuario', lazy=True, cascade="all, delete-orphan")
    sesiones = db.relationship('Sesion', backref='usuario', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Usuario {self.correo}>'


class Dispositivo(db.Model):
    __tablename__ = 'dispositivos'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    nombre_dispositivo = db.Column(db.String(200))
    navegador = db.Column(db.String(200))
    ip = db.Column(db.String(100))
    ubicacion = db.Column(db.String(200))
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_acceso = db.Column(db.DateTime, default=datetime.utcnow)
    reconocido = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Dispositivo {self.nombre_dispositivo} - IP {self.ip}>'


class Sesion(db.Model):
    __tablename__ = 'sesiones'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    dispositivo_id = db.Column(db.Integer, db.ForeignKey('dispositivos.id'), nullable=True)
    ip = db.Column(db.String(100))
    fecha_inicio = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_cierre = db.Column(db.DateTime, nullable=True)
    exito = db.Column(db.Boolean, default=True)
    tipo_acceso = db.Column(db.String(50))  # 'web', 'móvil', etc.

    dispositivo = db.relationship('Dispositivo', backref='sesiones', lazy=True)

    def __repr__(self):
        return f'<Sesion Usuario {self.usuario_id} desde IP {self.ip}>'
