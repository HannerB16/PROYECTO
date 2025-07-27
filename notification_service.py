# notification_service.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
from flask import current_app
from datetime import datetime
from models import Usuario
import os
import logging

class NotificationService:

    def __init__(self):
        self.env = Environment(loader=FileSystemLoader('templates'))

    def render_template(self, filename, **kwargs):
        template = self.env.get_template(filename)
        return template.render(**kwargs)

    def enviar_correo(self, asunto, destinatario, plantilla_html, **kwargs):
        try:
            html = self.render_template(plantilla_html, **kwargs)

            mensaje = MIMEMultipart("alternative")
            mensaje["Subject"] = asunto
            mensaje["From"] = os.getenv("MAIL_DEFAULT_SENDER")
            mensaje["To"] = destinatario

            mensaje.attach(MIMEText(html, "html"))

            with smtplib.SMTP(os.getenv("MAIL_SERVER"), int(os.getenv("MAIL_PORT"))) as servidor:
                servidor.starttls()
                servidor.login(os.getenv("MAIL_USERNAME"), os.getenv("MAIL_PASSWORD"))
                servidor.sendmail(
                    mensaje["From"],
                    mensaje["To"],
                    mensaje.as_string()
                )
            return True
        except Exception as e:
            logging.error(f"[ERROR ENVÍO CORREO] {str(e)}")
            raise Exception("No se pudo enviar el correo.")

    def enviar_bienvenida(self, usuario: Usuario):
        return self.enviar_correo(
            asunto="👋 ¡Bienvenido a la plataforma!",
            destinatario=usuario.correo,
            plantilla_html="EmailBienvenida.html",
            nombre=usuario.nombre
        )

    def enviar_alerta_dispositivo(self, usuario: Usuario, dispositivo):
        return self.enviar_correo(
            asunto="⚠️ Nuevo dispositivo detectado",
            destinatario=usuario.correo,
            plantilla_html="EmailNuevoDispositivo.html",
            nombre=usuario.nombre,
            ip=dispositivo.ip,
            navegador=dispositivo.navegador,
            ubicacion=dispositivo.ubicacion,
            fecha=datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        )

    def enviar_alerta_fuera_de_horario(self, usuario: Usuario, dispositivo):
        return self.enviar_correo(
            asunto="🚨 Acceso fuera de horario",
            destinatario=usuario.correo,
            plantilla_html="EmailAlertaFueraHorario.html",
            nombre=usuario.nombre,
            ip=dispositivo.ip,
            fecha=datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        )

    def enviar_cambio_contraseña(self, usuario: Usuario):
        return self.enviar_correo(
            asunto="🔐 Contraseña actualizada",
            destinatario=usuario.correo,
            plantilla_html="EmailCambioContraseña.html",
            nombre=usuario.nombre,
            fecha=datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        )


# Instancia lista para usar
notification_service = NotificationService()
