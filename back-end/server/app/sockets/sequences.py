# app/sockets/sequences.py

from flask import session as flask_session
from flask_socketio import emit
from ..extensions import socketio, db
from app.services import (
    get_latest_sequence,
    create_sequence
)
from ..models import Sequence, SequenceSteps


@socketio.on("get_sequences")
def handle_get_sequences(data):
    conv_id = data.get("conversationId")
    if not conv_id:
        return emit("error", {"msg": "No conversation_id provided"})
    steps = get_latest_sequence(int(conv_id)) or []
    emit("sequence_retrieved", {"sequence": steps})


@socketio.on("update_sequence")
def handle_update_sequence(data):
    """
    Receive updated execution plan steps and persist them.
    """
    conv_id = data.get("conversationId")
    seq_steps = data.get("sequence")
    if not conv_id or seq_steps is None:
        return emit("error", {"msg": "Invalid payload for update_sequence"})

    try:
        seq = create_sequence(int(conv_id), seq_steps)
    except Exception as e:
        return emit("error", {"msg": "Failed to update sequence"})

    # Emit back the updated list
    steps = [step.step_text for step in SequenceSteps.query
             .filter_by(sequence_id=seq.id)
             .order_by(SequenceSteps.step_number)]
    emit("sequence_updated", {"conversationId": conv_id, "sequence": steps})
