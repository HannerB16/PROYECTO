import os
from flask import Flask, render_template, redirect, url_for, session, request
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from extensions import jwt, mail
from api import api_bp


# Servicios
from services import (
    admin_service,
    auth_service,
    device_service,
    log_service,
    notification_service,
    password_service,
    session_service,
    user_service,
    validation_service,
    analytics_service
)

def create_app():
    app = Flask(__name__, static_folder='static', template_folder='templates')
    app.config.from_object(Config)

    # Inicializar extensiones
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    CORS(app)
    Migrate(app, db)

    # Registrar Blueprints
    app.register_blueprint(api_bp, url_prefix='/api')

    # Rutas de interfaz
    @app.route('/')
    def index():
        return redirect(url_for('auth_bp.login_page'))

    @app.route('/dashboard')
    def dashboard():
        if 'user_id' not in session:
            return redirect(url_for('auth_bp.login_page'))
        return render_template('dashboard.html')

    @app.route('/administrador')
    def administrador():
        if session.get("rol") != "Admin":
            return redirect(url_for('auth_bp.login_page'))
        return render_template('Administrador.html')

    @app.route('/registro')
    def registro():
        return render_template('registro.html')

    @app.route('/cambiar-contrasena')
    def cambiar_contrasena():
        return render_template('CambioContraseña.html')

    # Manejo de errores
    @app.errorhandler(404)
    def not_found(error):
        return render_template('404.html'), 404

    return app

# Ejecutar servidor
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
