# app/services/sequence_service.py

from typing import List, Optional
from ..models import Sequence, SequenceSteps
from ..extensions import db

def get_latest_sequence(conversation_id: int) -> Optional[List[str]]:
    """
    Fetch the most recent Sequence for a conversation and return its step texts as a list.
    Returns None if no Sequence exists.
    """
    seq = (
        Sequence.query
        .filter_by(conversation_id=conversation_id)
        .order_by(Sequence.created_at.desc())
        .first()
    )
    if not seq:
        return None

    steps = (
        SequenceSteps.query
        .filter_by(sequence_id=seq.id)
        .order_by(SequenceSteps.step_number)
        .all()
    )
    return [step.step_text for step in steps]

def create_sequence(conversation_id: int, steps: List[str]) -> Sequence:
    """
    Create a new Sequence for the given conversation and persist each step.
    Returns the Sequence object.
    """
    seq = Sequence(conversation_id=conversation_id)
    db.session.add(seq)
    db.session.flush()  # Assign seq.id without committing

    for idx, text in enumerate(steps, start=1):
        step = SequenceSteps(
            sequence_id=seq.id,
            step_number=idx,
            step_text=text
        )
        db.session.add(step)

    db.session.commit()
    return seq
