import jwt
import datetime
from flask import current_app

ACCESS_TOKEN_EXP_MINUTES = 15
REFRESH_TOKEN_EXP_DAYS = 7
ALGORITHM = "HS256"

def generate_access_token(user_data: dict) -> str:
    """
    Genera un token de acceso JWT válido por 15 minutos.
    """
    exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXP_MINUTES)
    payload = {
        "sub": user_data.get("id"),
        "username": user_data.get("username"),
        "email": user_data.get("email"),
        "rol": user_data.get("rol"),
        "exp": exp,
        "type": "access"
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm=ALGORITHM)


def generate_refresh_token(user_data: dict) -> str:
    """
    Genera un token de actualización (refresh) válido por 7 días.
    """
    exp = datetime.datetime.utcnow() + datetime.timedelta(days=REFRESH_TOKEN_EXP_DAYS)
    payload = {
        "sub": user_data.get("id"),
        "exp": exp,
        "type": "refresh"
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decodifica un token JWT (acceso o refresh). Lanza excepción si no es válido.
    """
    try:
        return jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise ValueError("El token ha expirado")
    except jwt.InvalidTokenError:
        raise ValueError("Token inválido")


def is_token_expired(token: str) -> bool:
    """
    Verifica si el token JWT ha expirado.
    """
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=[ALGORITHM])
        return False
    except jwt.ExpiredSignatureError:
        return True
    except jwt.InvalidTokenError:
        return True


def get_token_type(token: str) -> str:
    """
    Retorna el tipo de token: 'access' o 'refresh'.
    """
    payload = decode_token(token)
    return payload.get("type", "unknown")
