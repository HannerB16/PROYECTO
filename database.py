# database.py

import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from pathlib import Path

# Cargar variables de entorno desde el archivo .env
base_dir = Path(__file__).resolve().parent
env_path = base_dir.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Instancias globales
db = SQLAlchemy()
migrate = Migrate()

def init_db(app):
    """
    Inicializa la base de datos con la configuración de SQLAlchemy y Flask-Migrate.
    """
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    host = os.getenv('DB_HOST')
    port = os.getenv('DB_PORT', '3306')  # Default a 3306 si no se define
    name = os.getenv('DB_NAME')

    if not all([user, password, host, name]):
        raise ValueError("Faltan variables de entorno para la conexión a la base de datos")

    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
    }

    db.init_app(app)
    migrate.init_app(app, db)
