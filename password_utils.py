import bcrypt
import re

# Parámetros de complejidad (puedes ajustar según política interna)
MIN_LENGTH = 8
REQUIRES_UPPER = True
REQUIRES_NUMBER = True
REQUIRES_SPECIAL = True

def hash_password(password: str) -> str:
    """
    Genera un hash seguro para una contraseña usando bcrypt.
    """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(password: str, hashed: str) -> bool:
    """
    Compara una contraseña en texto plano con su hash.
    """
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def is_strong_password(password: str) -> bool:
    """
    Valida si una contraseña cumple con las políticas de complejidad.
    """
    if len(password) < MIN_LENGTH:
        return False
    if REQUIRES_UPPER and not re.search(r'[A-Z]', password):
        return False
    if REQUIRES_NUMBER and not re.search(r'\d', password):
        return False
    if REQUIRES_SPECIAL and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    return True


def password_strength_message(password: str) -> str:
    """
    Devuelve el motivo si la contraseña no es válida.
    """
    if len(password) < MIN_LENGTH:
        return f"La contraseña debe tener al menos {MIN_LENGTH} caracteres."
    if REQUIRES_UPPER and not re.search(r'[A-Z]', password):
        return "La contraseña debe incluir al menos una letra mayúscula."
    if REQUIRES_NUMBER and not re.search(r'\d', password):
        return "La contraseña debe incluir al menos un número."
    if REQUIRES_SPECIAL and not re.search(r'[!@#$%^&*(),.?\":{}|<>]', password):
        return "La contraseña debe incluir al menos un carácter especial."
    return "Contraseña válida."
