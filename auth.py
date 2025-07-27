from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from services import auth_service, device_service, notification_service
from utils.token_utils import generate_access_token, token_required
from utils.device_utils import get_device_info
from sqlalchemy.exc import SQLAlchemyError

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def registrar_usuario():
    """
    Registra un nuevo usuario con email y contraseña cifrada.
    """
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not email or not username or not password:
        return jsonify({'success': False, 'message': 'Faltan datos'}), 400

    try:
        creado = auth_service.registrar_usuario(email, username, password)
        if not creado:
            return jsonify({'success': False, 'message': 'Correo o usuario ya existe'}), 409
        return jsonify({'success': True, 'message': 'Usuario registrado exitosamente'}), 201
    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Autentica al usuario, devuelve JWT y registra dispositivo si es nuevo.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Faltan credenciales'}), 400

    try:
        usuario = auth_service.verificar_credenciales(email, password)
        if not usuario:
            return jsonify({'success': False, 'message': 'Credenciales inválidas'}), 401

        # Info del dispositivo desde headers
        info_dispositivo = get_device_info(request)
        es_nuevo, dispositivo_id = device_service.registrar_o_verificar(usuario['id'], info_dispositivo)

        if es_nuevo:
            notification_service.enviar_alerta_dispositivo_nuevo(usuario['email'], info_dispositivo)

        token = generate_access_token(usuario['id'], usuario['role'])

        return jsonify({
            'success': True,
            'message': 'Login exitoso',
            'token': token,
            'rol': usuario['role'],
            'username': usuario['username']
        }), 200

    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@auth_bp.route('/change-password', methods=['POST'])
@token_required
def cambiar_password(usuario_actual):
    """
    Cambia la contraseña del usuario autenticado.
    """
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({'success': False, 'message': 'Faltan datos'}), 400

    try:
        actualizado = auth_service.cambiar_password(usuario_actual['id'], old_password, new_password)
        if not actualizado:
            return jsonify({'success': False, 'message': 'Contraseña actual incorrecta'}), 403

        return jsonify({'success': True, 'message': 'Contraseña actualizada'}), 200
    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': str(e)}), 500
