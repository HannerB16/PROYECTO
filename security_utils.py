import secrets
import string
from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password):
    """
    Genera un hash seguro para una contraseña.
    """
    return generate_password_hash(password)

def verify_password(password, hashed):
    """
    Verifica si una contraseña coincide con su hash.
    """
    return check_password_hash(hashed, password)

def generate_secure_token(length=64):
    """
    Genera un token seguro aleatorio.
    """
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def get_password_strength(password):
    """
    Evalúa la fortaleza de una contraseña.
    """
    if len(password) < 8:
        return "débil"
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in string.punctuation for c in password)

    score = sum([has_upper, has_lower, has_digit, has_special])
    if score >= 3:
        return "fuerte"
    elif score == 2:
        return "aceptable"
    else:
        return "débil"

def mask_email(email):
    """
    Oculta parcialmente un correo para mostrarlo en alertas.
    Ej: j***e@gmail.com
    """
    try:
        username, domain = email.split('@')
        if len(username) < 2:
            return "***@" + domain
        return username[0] + "***" + username[-1] + "@" + domain
    except Exception:
        return "correo no válido"
