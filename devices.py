from flask import Blueprint, jsonify, request
from services import device_service
from utils.token_utils import token_required
from sqlalchemy.exc import SQLAlchemyError

devices_bp = Blueprint('devices_bp', __name__, url_prefix='/api/devices')


@devices_bp.route('/list', methods=['GET'])
@token_required
def listar_dispositivos(usuario_actual):
    """
    Retorna los dispositivos registrados por el usuario autenticado.
    """
    try:
        dispositivos = device_service.obtener_dispositivos(usuario_actual['id'])
        return jsonify({'success': True, 'devices': dispositivos}), 200
    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@devices_bp.route('/delete/<int:device_id>', methods=['DELETE'])
@token_required
def eliminar_dispositivo(usuario_actual, device_id):
    """
    Elimina un dispositivo registrado por el usuario.
    """
    try:
        eliminado = device_service.eliminar_dispositivo(usuario_actual['id'], device_id)
        if eliminado:
            return jsonify({'success': True, 'message': 'Dispositivo eliminado'}), 200
        else:
            return jsonify({'success': False, 'message': 'No se encontró o no pertenece al usuario'}), 404
    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@devices_bp.route('/activity', methods=['GET'])
@token_required
def historial_de_sesiones(usuario_actual):
    """
    Devuelve el historial de accesos del usuario, por dispositivo.
    """
    try:
        historial = device_service.obtener_historial_accesos(usuario_actual['id'])
        return jsonify({'success': True, 'historial': historial}), 200
    except SQLAlchemyError as e:
        return jsonify({'success': False, 'message': str(e)}), 500
