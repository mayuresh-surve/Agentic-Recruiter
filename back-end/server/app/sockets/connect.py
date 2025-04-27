# app/sockets/connect.py

from flask import session as flask_session
from flask_socketio import emit
from ..extensions import socketio

@socketio.on("connect")
def handle_connect():
    """
    When a client connects, verify they’re authenticated.
    """
    user_id = flask_session.get("user_id")
    if not user_id:
        emit("error", {"msg": "Not authenticated"})
    else:
        emit("connected", {"userId": user_id})
