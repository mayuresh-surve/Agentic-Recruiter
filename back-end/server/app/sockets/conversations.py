# app/sockets/conversations.py

from flask import session as flask_session
from flask_socketio import emit
from ..extensions import socketio
from app.services import (
    get_user_conversations,
    create_conversation,
    get_conversation_messages,
)

@socketio.on("get_conversations")
def handle_get_conversations():
    user_id = flask_session.get("user_id")
    if not user_id:
        return emit("error", {"msg": "Not authenticated"})
    convs = get_user_conversations(user_id)
    emit("conversation_list", convs)


@socketio.on("new_conversation")
def handle_new_conversation():
    user_id = flask_session.get("user_id")
    if not user_id:
        return emit("error", {"msg": "Not authenticated"})
    convo = create_conversation(user_id)
    emit("conversation_created", {"id": str(convo.id), "name": f"Conversation {convo.id}"})


@socketio.on("select_conversation")
def handle_select_conversation(data):
    conv_id = data.get("conversationId")
    if not conv_id:
        return emit("error", {"msg": "No conversation_id provided"})
    msgs = get_conversation_messages(int(conv_id))
    emit("conversation_messages", {"messages": msgs})
