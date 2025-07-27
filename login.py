from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token
from models import Usuario
from database import get_db_session
from utils.device_utils import obtener_info_dispositivo  # Debes tener este helper
from services.notification_service import notificar_dispositivo_nuevo  # Debes tener este servicio
from sqlalchemy.exc import SQLAlchemyError

login_bp = Blueprint('login_bp', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Email y contraseña son obligatorios"}), 400

    session = get_db_session()
    try:
        user = session.query(Usuario).filter_by(email=data['email']).first()

        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({"error": "Credenciales inválidas"}), 401

        # Generar token JWT
        access_token = create_access_token(identity={"id": user.id, "rol": user.rol})

        # Obtener datos del dispositivo
        dispositivo_info = obtener_info_dispositivo(request)
        dispositivo_id = f"{dispositivo_info['ip']}-{dispositivo_info['user_agent']}"

        # Verificar si es un nuevo dispositivo
        dispositivo_existente = session.query(Usuario).filter_by(
            id=user.id, dispositivos=dispositivo_id
        ).first()

        if not dispositivo_existente:
            # Registrar el dispositivo (esto depende de tu modelo exacto)
            user.registrar_dispositivo(dispositivo_id, dispositivo_info)
            session.commit()

            # Notificar al usuario
            notificar_dispositivo_nuevo(user.email, dispositivo_info)

        return jsonify({
            "message": "Login exitoso",
            "access_token": access_token,
            "rol": user.rol
        }), 200

    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"error": "Error en base de datos"}), 500
    finally:
        session.close()
