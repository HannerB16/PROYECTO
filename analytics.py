from flask import Blueprint, jsonify, request
from services import analytics_service
from flask_jwt_extended import jwt_required, get_jwt_identity

analytics_bp = Blueprint('analytics_bp', __name__, url_prefix='/api/analytics')

# Requiere JWT para proteger los endpoints
@analytics_bp.route('/login-stats', methods=['GET'])
@jwt_required()
def login_stats():
    user_id = get_jwt_identity()
    stats = analytics_service.get_login_statistics(user_id)
    return jsonify(stats), 200

@analytics_bp.route('/device-summary', methods=['GET'])
@jwt_required()
def device_summary():
    user_id = get_jwt_identity()
    summary = analytics_service.get_device_summary(user_id)
    return jsonify(summary), 200

@analytics_bp.route('/recent-accesses', methods=['GET'])
@jwt_required()
def recent_accesses():
    user_id = get_jwt_identity()
    logs = analytics_service.get_recent_access_logs(user_id)
    return jsonify(logs), 200

@analytics_bp.route('/user-activity', methods=['GET'])
@jwt_required()
def user_activity():
    user_id = get_jwt_identity()
    activity = analytics_service.get_user_activity(user_id)
    return jsonify(activity), 200
