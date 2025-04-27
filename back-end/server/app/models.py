from .extensions import db
from datetime import datetime, timezone


class Conversation(db.Model):
    __tablename__ = "conversations"
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.now(tz=timezone.utc))
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    phase = db.Column(
        db.String(32),
        nullable=False,
        default="gathering"
    )
    user = db.relationship("User", back_populates="conversations")
    messages = db.relationship("Message",
                               back_populates="conversation",
                               cascade="all, delete-orphan")
    sequences = db.relationship(
        "Sequence",
        back_populates="conversation",
        cascade="all, delete-orphan"
    )


class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer,
                                db.ForeignKey("conversations.id"),
                                nullable=False,
                                index=True)
    sender = db.Column(db.String(16), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now(tz=timezone.utc))

    conversation = db.relationship("Conversation", back_populates="messages")


class Sequence(db.Model):
    __tablename__ = "sequences"
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(
        db.Integer,
        db.ForeignKey("conversations.id"),
        nullable=False,
        index=True
    )
    created_at = db.Column(db.DateTime, default=datetime.now(tz=timezone.utc))

    conversation = db.relationship("Conversation", back_populates="sequences")

class SequenceSteps(db.Model):
    __tablename__ = "sequence_steps"
    id = db.Column(db.Integer, primary_key=True)
    sequence_id = db.Column(
        db.Integer,
        db.ForeignKey("sequences.id"),
        nullable=False,
        index=True
    )
    step_text = db.Column(db.Text, nullable=False)
    step_number = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(tz=timezone.utc))

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    onboarded = db.Column(db.Boolean, default=False)
    name = db.Column(db.String(64), nullable=True)
    company_name = db.Column(db.String(64), nullable=True)
    role = db.Column(db.String(64), nullable=True)
    industry = db.Column(db.String(64), nullable=True)
    roles_hire = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(tz=timezone.utc))

    conversations = db.relationship("Conversation", back_populates="user")
    
    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "onboarded": self.onboarded,
            "name": self.name,
            "company_name": self.company_name,
            "role": self.role,
            "industry": self.industry,
            "roles_hire": self.roles_hire
        }
