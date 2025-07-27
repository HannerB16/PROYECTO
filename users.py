from flask import Blueprint, request, jsonify
from services import auth_service
from utils.token_utils import token_required
from sqlalchemy.exc import SQLAlchemyError

users_bp = Blueprint('users_bp', __name__, url_prefix='/api/users')


@users_bp.route('/register', methods=['POST'])
def registrar_usuario():
    """
    Registra un nuevo usuario.
    """
    try:
        data = request.get_json()

        required_fields = ['username', 'email', 'password']
        if not all(k in data for k in required_fields):
            return jsonify({'success': False, 'message': 'Faltan campos obligatorios'}), 400

        resultado = auth_service.registrar_usuario(data['username'], data['email'], data['password'])

        if resultado['success']:
            return jsonify({'success': True, 'message': 'Usuario registrado correctamente'}), 201
        else:
            return jsonify({'success': False, 'message': resultado['message']}), 400

    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': f'Error de base de datos: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error desconocido: {str(e)}'}), 500


@users_bp.route('/me', methods=['GET'])
@token_required
def obtener_usuario_autenticado(usuario_actual):
    """
    Devuelve los datos del usuario autenticado mediante token.
    """
    try:
        return jsonify({
            'success': True,
            'user': {
                'id': usuario_actual['id'],
                'username': usuario_actual['username'],
                'email': usuario_actual['email'],
                'rol': usuario_actual['rol']
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500
