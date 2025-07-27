# config.py

import os
from dotenv import load_dotenv
from pathlib import Path

# Cargar variables de entorno
base_dir = Path(__file__).resolve().parent
env_path = base_dir.parent / '.env'
load_dotenv(dotenv_path=env_path)


class Config:
    # Base
    SECRET_KEY = os.getenv('SECRET_KEY', 'clave_insegura_dev')
    DEBUG = os.getenv('FLASK_DEBUG', 'False') == 'True'

    # Base de datos
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'clave_jwt_insegura')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_EXPIRES', 3600))  # en segundos
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv('JWT_REFRESH_EXPIRES', 86400))  # en segundos

    # Seguridad general
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True

    # Mail
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False') == 'True'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER')


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True


# Diccionario de entornos disponibles
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}
