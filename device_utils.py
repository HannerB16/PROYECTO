import hashlib
from user_agents import parse as parse_user_agent
from flask import request


def get_device_info():
    """
    Extrae información relevante del dispositivo a partir del User-Agent.
    Retorna un diccionario con datos clave.
    """
    user_agent_str = request.headers.get('User-Agent', '')
    user_agent = parse_user_agent(user_agent_str)

    return {
        "dispositivo": "Móvil" if user_agent.is_mobile else "PC" if user_agent.is_pc else "Desconocido",
        "navegador": f"{user_agent.browser.family} {user_agent.browser.version_string}",
        "sistema_operativo": f"{user_agent.os.family} {user_agent.os.version_string}",
        "user_agent": user_agent_str
    }


def get_ip_address():
    """
    Detecta la dirección IP del cliente.
    """
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    return request.remote_addr or '0.0.0.0'


def generate_device_fingerprint():
    """
    Genera una huella única (hash) del dispositivo a partir de IP y User-Agent.
    """
    ip = get_ip_address()
    user_agent = request.headers.get('User-Agent', '')
    fingerprint_raw = f"{ip}_{user_agent}"
    return hashlib.sha256(fingerprint_raw.encode()).hexdigest()


def is_new_device(user_id, fingerprint, session):
    """
    Verifica si la huella del dispositivo ya está registrada para el usuario.
    """
    from models import Dispositivo  # Evitar import circular

    existing_device = session.query(Dispositivo).filter_by(user_id=user_id, fingerprint=fingerprint).first()
    return existing_device is None


def register_device(user_id, session):
    """
    Registra un nuevo dispositivo para el usuario si no existe.
    """
    from models import Dispositivo  # Evitar import circular
    device_info = get_device_info()
    ip = get_ip_address()
    fingerprint = generate_device_fingerprint()

    if is_new_device(user_id, fingerprint, session):
        nuevo_dispositivo = Dispositivo(
            user_id=user_id,
            ip=ip,
            dispositivo=device_info['dispositivo'],
            navegador=device_info['navegador'],
            sistema_operativo=device_info['sistema_operativo'],
            fingerprint=fingerprint
        )
        session.add(nuevo_dispositivo)
        session.commit()
        return nuevo_dispositivo
    else:
        return None  # Ya registrado
