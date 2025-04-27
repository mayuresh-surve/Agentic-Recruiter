

# app/services/message_service.py

from typing import List, Dict
from ..models import Message
from ..extensions import db

def save_message(conversation_id: int, text: str, role: str) -> Message:
    """
    Persist a new user message to the given conversation.
    Returns the saved Message object.
    """
    msg = Message(
        conversation_id=conversation_id,
        sender=role,
        content=text
    )
    db.session.add(msg)
    db.session.commit()
    return msg

def get_history(conversation_id: int) -> List[Dict]:
    """
    Retrieve all messages for a conversation, ordered by timestamp.
    Returns a list of dicts with id, sender, content, and timestamp.
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