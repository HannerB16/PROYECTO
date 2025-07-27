import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader
import os
import logging

# Configuración del servidor SMTP (deberías cargar estos valores desde config/env)
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "tu_correo@gmail.com"
SMTP_PASSWORD = "tu_contraseña_app"
FROM_EMAIL = "Plataforma Web <tu_correo@gmail.com>"

# Carpeta donde están tus plantillas
TEMPLATE_FOLDER = os.path.join(os.path.dirname(__file__), "..", "templates", "emails")

# Logger
logger = logging.getLogger(__name__)
env = Environment(loader=FileSystemLoader(TEMPLATE_FOLDER))


def render_template(template_name, **kwargs):
    """
    Renderiza una plantilla HTML de correo con Jinja2.
    """
    try:
        template = env.get_template(template_name)
        return template.render(**kwargs)
    except Exception as e:
        logger.error(f"Error renderizando plantilla {template_name}: {str(e)}")
        return ""


def send_email(to_email, subject, html_content):
    """
    Envía un correo electrónico con contenido HTML.
    """
    try:
        message = MIMEMultipart()
        message['From'] = FROM_EMAIL
        message['To'] = to_email
        message['Subject'] = subject

        message.attach(MIMEText(html_content, 'html'))

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(message)
        server.quit()
        logger.info(f"Correo enviado a {to_email} con asunto '{subject}'")
    except Exception as e:
        logger.error(f"Error enviando correo a {to_email}: {str(e)}")


# Funciones específicas de envío
def send_welcome_email(to_email, nombre_usuario):
    html = render_template("EmailBienvenida.html", nombre=nombre_usuario)
    send_email(to_email, "¡Bienvenido a la Plataforma!", html)


def send_password_reset_email(to_email, token):
    html = render_template("EmailCambioContraseña.html", reset_link=f"https://tu-dominio.com/recuperar/{token}")
    send_email(to_email, "Restablece tu contraseña", html)


def send_device_alert_email(to_email, device_info, location):
    html = render_template("EmailNuevoDispositivo.html", dispositivo=device_info, ubicacion=location)
    send_email(to_email, "Nuevo acceso detectado", html)


def send_custom_email(to_email, subject, body_data, template_file):
    html = render_template(template_file, **body_data)
    send_email(to_email, subject, html)
