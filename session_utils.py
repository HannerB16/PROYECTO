import jwt
import datetime
from flask import current_app

# Configuración de seguridad del token (puede estar en config.py)
SECRET_KEY = current_app.config.get("SECRET_KEY", "clave_secreta_cambiame")
ALGORITHM = "HS256"
EXPIRATION_MINUTES = 60  # duración del token (puedes ajustar)

def generate_token(data: dict, expires_in: int = EXPIRATION_MINUTES) -> str:
    """
    Genera un token JWT con los datos del usuario.
    """
    expiration = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_in)
    payload = {
        **data,
        "exp": expiration
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decodifica un token JWT. Lanza excepción si es inválido o expirado.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("El token ha expirado")
    except jwt.InvalidTokenError:
        raise ValueError("Token inválido")


def validate_token(token: str) -> bool:
    """
    Verifica si el token es válido y no ha expirado.
    """
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return True
    except jwt.PyJWTError:
        return False
