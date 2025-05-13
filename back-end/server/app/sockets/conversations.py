# app/sockets/conversations.py

from flask import session as flask_session
from flask_socketio import emit
from ..extensions import socketio
from app.services import (
    get_user_conversations,
    create_conversation,
    get_conversation,
    get_conversation_messages,
    update_conversation_title
)
from app.llm import complete as ask_llm, CREATE_CONVERSATION_TITLE, ConversationTitle


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
    emit("conversation_created", {"id": str(
        convo.id), "name": f"Conversation {convo.id}"})


@socketio.on("select_conversation")
def handle_select_conversation(data):
    conv_id = data.get("conversationId")
    if not conv_id:
        return emit("error", {"msg": "No conversation_id provided"})
    msgs = get_conversation_messages(int(conv_id))
    emit("conversation_messages", {"messages": msgs})


def _generate_conversation_title(message):
    """Function to generate a title for the conversation based on the message."""
    response_obj = ask_llm(
        message, output_format=ConversationTitle, instructions=CREATE_CONVERSATION_TITLE)
    return ConversationTitle.model_validate(response_obj)


@socketio.on("update_conversation_title")
def handle_update_conversation_title(data):
    conv_id = data.get("conversationId")
    message = data.get("message")
    if not conv_id or not message:
        return emit("error", {"msg": "No conversation_id or title provided"})

    conversation = get_conversation(int(conv_id))
    if not conversation:
        return emit("error", {"msg": "Conversation not found"})

    if conversation.title:
        new_title = conversation.title
    else:
        response = _generate_conversation_title(message)
        new_title = response.title
        update_conversation_title(int(conv_id), new_title)

    emit("conversation_title_updated", {
         "conversationId": str(conv_id), "title": new_title})
