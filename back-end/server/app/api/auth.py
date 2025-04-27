from flask import Blueprint, request, jsonify, session as flask_session  # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash  # type: ignore
from ..models import db, User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    pwd_hash = generate_password_hash(password)
    user = User(
        email=email,
        password=pwd_hash,
        name=data.get("name"),
        company_name=data.get("company_name"),
        role=data.get("role"),
        industry=data.get("industry"),
        roles_hire=data.get("roles_hire"),
        onboarded=bool(data.get("name"))
    )
    db.session.add(user)
    db.session.commit()

    flask_session.permanent = True
    flask_session["user_id"] = user.id

    return jsonify({"user": user.to_dict()}), 201

@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    flask_session.permanent = True
    flask_session["user_id"] = user.id
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.get("/me")
def me():
    uid = flask_session.get('user_id')
    if not uid:
        return jsonify({'user': None}), 200
    user = User.query.get(uid)
    if not user:
        flask_session.clear()
        return jsonify({"user": None}), 200
    return jsonify({"user": user.to_dict()}), 200

@auth_bp.post("/complete_onboarding")
def complete_onboarding():
    uid = flask_session.get('user_id')
    
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json() or {}
    user = User.query.get(uid)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.name = data.get("name", user.name)
    user.company_name = data.get("company_name", user.company_name)
    user.role = data.get("role", user.role)
    user.industry = data.get("industry", user.industry)
    user.roles_hire = data.get("roles_hire", user.roles_hire)
    user.onboarded = True
    db.session.commit()
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.post("/logout")
def logout():
    flask_session.clear()
    return "", 204