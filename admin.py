from flask import Blueprint, request, jsonify
from services import admin_service
from utils.token_utils import token_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/admin')

# Verifica token y si el usuario es admin
def admin_required(f):
    @token_required
    def wrapper(current_user, *args, **kwargs):
        if current_user['role'] != 'admin':
            return jsonify({'success': False, 'message': 'Acceso restringido a administradores'}), 403
        return f(current_user, *args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def dashboard(current_user):
    """
    Panel general con resumen de usuarios y dispositivos.
    """
    try:
        summary = admin_service.obtener_resumen()
        return jsonify({'success': True, 'data': summary}), 200
    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/usuarios', methods=['GET'])
@admin_required
def listar_usuarios(current_user):
    """
    Devuelve la lista de usuarios registrados.
    """
    try:
        usuarios = admin_service.listar_usuarios()
        return jsonify({'success': True, 'usuarios': usuarios}), 200
    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/usuarios/<int:user_id>', methods=['DELETE'])
@admin_required
def eliminar_usuario(current_user, user_id):
    """
    Elimina un usuario específico.
    """
    try:
        resultado = admin_service.eliminar_usuario(user_id)
        if resultado:
            return jsonify({'success': True, 'message': 'Usuario eliminado'}), 200
        else:
            return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404
    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/usuarios/<int:user_id>/reset-password', methods=['POST'])
@admin_required
def restablecer_contrasena(current_user, user_id):
    """
    Restablece la contraseña de un usuario (se define una nueva o se genera aleatoria).
    """
    nueva_password = request.json.get('nueva_password')
    if not nueva_password:
        return jsonify({'success': False, 'message': 'La nueva contraseña es requerida'}), 400

    try:
        admin_service.cambiar_password(user_id, nueva_password)
        return jsonify({'success': True, 'message': 'Contraseña actualizada correctamente'}), 200
    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/dispositivos', methods=['GET'])
@admin_required
def ver_dispositivos(current_user):
    """
    Devuelve todos los dispositivos registrados.
    """
    try:
        dispositivos = admin_service.listar_dispositivos()
        return jsonify({'success': True, 'dispositivos': dispositivos}), 200
    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/logs', methods=['GET'])
@admin_required
def ver_logs(current_user):
    """
    Devuelve eventos del sistema o seguridad (audit trail).
    """
    try:
        logs = admin_service.obtener_logs()
        return jsonify({'success': True, 'logs': logs}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
