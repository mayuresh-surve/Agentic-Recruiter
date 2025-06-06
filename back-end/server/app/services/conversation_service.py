# app/services/conversation_service.py
from typing import List, Dict
from ..models import Conversation, Message
from ..extensions import db

def get_user_conversations(user_id: int) -> List[Dict]:
    """
    Return a list of conversations for a given user.
    Each conversation is represented as a dict with id and creation timestamp.
    """
    convs = (
        Conversation.query
        .filter_by(user_id=user_id)
        .order_by(Conversation.created_at)
        .all()
    )
    return [
        {"id": str(conv.id), "name": conv.title if conv.title else f"Conversation {i + 1}"}
        for i, conv in enumerate(convs)
    ]

def create_conversation(user_id: int) -> Conversation:
    """
    Create a new Conversation for the user and return the Conversation object.
    """
    conv = Conversation(user_id=user_id)
    db.session.add(conv)
    db.session.commit()
    return conv

def get_conversation(conversation_id: int) -> Conversation:
    """
    Return a Conversation object for a given conversation_id.
    """
    return Conversation.query.get(conversation_id)

def update_conversation_title(conversation_id: int, title: str) -> None:
    """
    Update the title of a conversation.
    """
    conversation = get_conversation(conversation_id)
    if conversation:
        conversation.title = title
        db.session.commit()
    else:
        raise ValueError("Conversation not found")

def get_conversation_messages(conversation_id: int) -> List[Dict]:
    """
    Return all messages for a conversation as a list of dicts,
    each containing id, sender, content, and timestamp.
    """
    msgs = (
        Message.query
        .filter_by(conversation_id=conversation_id)
        .order_by(Message.timestamp)
        .all()
    )
    return [
        {
            "id": msg.id,
            "from": msg.sender,
            "text": msg.content,
            "conversationId": str(msg.conversation_id),
        }
        for msg in msgs
    ]
