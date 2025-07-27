# security.py

import re
import jwt
import os
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from pathlib import Path

# Cargar variables de entorno
base_dir = Path(__file__).resolve().parent
env_path = base_dir.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Claves JWT
JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'clave_jwt_insegura')
JWT_EXPIRATION_SECONDS = int(os.getenv('JWT_ACCESS_EXPIRES', 3600))


# =============================
# HASH DE CONTRASEÑAS
# =============================

def hash_password(plain_password):
    """
    Retorna el hash seguro de una contraseña en texto plano.
    """
    return generate_password_hash(plain_password)


def verify_password(plain_password, hashed_password):
    """
    Verifica si la contraseña ingresada coincide con el hash almacenado.
    """
    return check_password_hash(hashed_password, plain_password)


# =============================
# TOKENS JWT
# =============================

def generate_jwt(payload, expires_in=JWT_EXPIRATION_SECONDS):
    """
    Genera un token JWT con un payload personalizado y expiración.
    """
    payload['exp'] = datetime.utcnow() + timedelta(seconds=expires_in)
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def decode_jwt(token):
    """
    Decodifica un JWT y devuelve su payload si es válido.
    """
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None  # Token expirado
    except jwt.InvalidTokenError:
        return None  # Token inválido


# =============================
# VALIDACIÓN DE CONTRASEÑAS
# =============================

def is_strong_password(password):
    """
    Verifica que la contraseña sea fuerte:
    - Al menos 8 caracteres
    - Incluye mayúsculas, minúsculas, números y símbolos
    """
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[\W_]", password):  # Caracteres especiales
        return False
    return True
