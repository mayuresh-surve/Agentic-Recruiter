from flask import current_app, session as flask_session
from flask_socketio import emit  # type: ignore
from .extensions import socketio, db
from .models import Conversation, Message, User, Sequence, SequenceSteps
from .llm.client import complete as ask_llm
from .llm.prompts import PLANNER_PROMPT, SEQUENCE_GENERATOR_PROMPT, UPDATE_SEQUENCE_PROMPT
from .llm.schemas import AskResponse, SequenceResponse


@socketio.on("connect")
def handle_connect():
    emit("connected")


@socketio.on("select_conversation")
def handle_select_conversation(conversation_id):
    """
    Client selects a conversation; emit its messages.
    """
    messages = (
        Message.query
        .filter_by(conversation_id=conversation_id)
        .order_by(Message.timestamp)
        .all()
    )
    msgs_payload = [
        {
            "id": msg.id,
            "from": msg.sender,
            "text": msg.content,
            "conversationId": str(msg.conversation_id)
        }
        for msg in messages
    ]
    emit("conversation_messages", msgs_payload)


@socketio.on("get_conversations")
def handle_get_conversations():
    """
    Fetch all conversations for the current browser session and emit them back.
    """
    user_id = flask_session.get("user_id")
    if not user_id:
        return emit("error", {"msg": "Not authenticated"})

    conversations = (
        Conversation.query
        .filter_by(user_id=user_id)
        .order_by(Conversation.created_at)
        .all()
    )

    conv_list = [
        {"id": str(conv.id), "name": f"Conversation {conv.id}"}
        for conv in conversations
    ]

    # Emit the list back to front end
    emit("conversation_list", conv_list)


@socketio.on("get_sequences")
def handle_get_sequences(conversation_id):
    """
    Fetch all sequences for the current browser session and emit them back.
    """
    if not conversation_id:
        return emit("error", {"msg": "No conversation_id provided"})
    sequence = (
        Sequence.query
        .filter_by(conversation_id=conversation_id)
        .order_by(Sequence.created_at.desc())
        .first()
    )
    if sequence:
        steps_objs = (
            SequenceSteps.query
            .filter_by(sequence_id=sequence.id)
            .order_by(SequenceSteps.step_number)
            .all())
        steps = [step.step_text for step in steps_objs]
        emit("sequence_retrieved", {"sequence": steps})
    else:
        emit("sequence_retrieved", {"sequence": []})


@socketio.on("new_conversation")
def handle_new_chat():
    user_id = flask_session.get("user_id")
    print(user_id)
    if not user_id:
        return emit("error", {"msg": "Not authenticated"})
    convo = Conversation(user_id=user_id)
    db.session.add(convo)
    db.session.commit()

    # Return a new conversation ID
    emit("conversation_created", str(convo.id))


@socketio.on("update_sequence")
def handle_update_sequence(data):
    conversation_id = data.get("conversationId")
    sequence_steps = data.get("sequence")

    if not conversation_id or sequence_steps is None:
        return emit("error", {"msg": "No conversation_id or sequence provided"})

    try:
        conv_id = int(conversation_id)
    except (ValueError, TypeError):
        return emit("error", {"msg": "Invalid conversation ID"})
    # Create a new sequence record
    seq = Sequence(conversation_id=conversation_id)
    db.session.add(seq)
    db.session.flush()

    # Persist each step in order
    for idx, step_text in enumerate(sequence_steps, start=1):
        step = SequenceSteps(
            sequence_id=seq.id,
            step_text=step_text,
            step_number=idx
        )
        db.session.add(step)
    db.session.commit()

    emit("sequence_updated", {
        "conversationId": conv_id
    })


@socketio.on("user_message")
def handle_user_message(data):
    """
    Receive a user message payload, persist it, build full history prompt,
    call the LLM, save the bot response, and emit it back to the client.
    """
    # save user messages
    conv_id = data.get("conversationId")
    user_id = flask_session.get("user_id")
    if not conv_id:
        return emit("error", {"msg": "No conversation_id provided"})
    user_text = data.get("text", "")
    user_msg = Message(
        conversation_id=conv_id,
        sender="user",
        content=user_text
    )
    db.session.add(user_msg)
    db.session.commit()

    # Fetch conversation history
    history = (
        Message.query
        .filter_by(conversation_id=conv_id)
        .order_by(Message.timestamp)
        .all()
    )

    user = User.query.get(user_id)

    system_prompt = PLANNER_PROMPT.format(
        company_name=user.company_name, user_role=user.role, industry=user.industry, roles_hire=user.roles_hire)
    messages = []
    for msg in history:
        role = "assistant" if msg.sender == "bot" else "user"
        messages.append({"role": role, "content": msg.content})

    # Call LLM helper
    try:
        bot_response = ask_llm(
            messages, output_format=AskResponse, instructions=system_prompt)
        bot_message: AskResponse = AskResponse.model_validate(bot_response)
    except Exception as e:
        bot_response = "Sorry, I encountered an error."
        current_app.logger.error(f"LLM call failed: {e}")

    if bot_message is not None and not bot_message.ready_for_executions:
        bot_msg = Message(
            conversation_id=conv_id,
            sender="bot",
            content=bot_message.next_step
        )
        db.session.add(bot_msg)
        db.session.commit()

        # Emit the response back to the front end
        emit("bot_message", {
             "text": bot_message.next_step, "conversationId": conv_id})
    elif bot_message and bot_message.ready_for_executions and not bot_message.is_update_sequence:
        sequence_messages = [{
            "role": "user", "content": bot_message.next_step + "\nInformation available for you to work on the task:\n" + bot_message.information_gathered
        }]

        try:
            sequence_response = ask_llm(
                sequence_messages, output_format=SequenceResponse, instructions=SEQUENCE_GENERATOR_PROMPT, temperature=0.5)
            sequence_obj: SequenceResponse = SequenceResponse.model_validate(
                sequence_response)
        except Exception as e:
            current_app.logger.error(f"LLM call failed: {e}")
            return emit("error", {"msg": "Failed to generate sequence."})

        if sequence_obj and sequence_obj.steps:
            seq_record = Sequence(conversation_id=conv_id)
            db.session.add(seq_record)
            db.session.flush()
            step_strings = []
            for i, step in enumerate(sequence_obj.steps):
                step_strings.append(step.explanation)
                step_record = SequenceSteps(
                    sequence_id=seq_record.id,
                    step_text=step.explanation,
                    step_number=i + 1
                )
                db.session.add(step_record)
            db.session.commit()

            emit("sequence_retrieved", {
                "sequence": step_strings
            })
        else:
            emit("sequence_retrieved", {
                "sequence": []
            })
        if sequence_obj and sequence_obj.description:
            bot_msg = Message(
                conversation_id=conv_id,
                sender="bot",
                content=sequence_obj.description
            )
            db.session.add(bot_msg)
            db.session.commit()
            emit("bot_message", {
                "text": sequence_obj.description,
                "conversationId": conv_id
            })

    elif bot_message and bot_message.ready_for_executions and bot_message.is_update_sequence:
        """
        User has requested to update the existing sequence.
        Build a new sequence based on the updated instructions and persist.
        """
        # Fetch the latest stored sequence for this conversation
        existing_seq = (
            Sequence.query
            .filter_by(conversation_id=conv_id)
            .order_by(Sequence.created_at.desc())
            .first()
        )
        if existing_seq:
            step_objs = (
                SequenceSteps.query
                .filter_by(sequence_id=existing_seq.id)
                .order_by(SequenceSteps.step_number)
                .all()
            )
            # build numbered plan text
            existing_sequence_text = "\n".join(
                f"{idx+1}. {step.step_text}" for idx, step in enumerate(step_objs)
            )
        else:
            existing_sequence_text = ""

        # Build messages for LLM to update the sequence, including the existing plan
        sequence_update_msgs = [
            {"role": "user", "content": f"{bot_message.next_step} \n\n Current plan:\n{existing_sequence_text}"},
        ]
        try:
            seq_resp = ask_llm(
                sequence_update_msgs,
                output_format=SequenceResponse,
                instructions=UPDATE_SEQUENCE_PROMPT,
                temperature=0.5
            )
            sequence_obj: SequenceResponse = SequenceResponse.model_validate(
                seq_resp)
        except Exception as e:
            current_app.logger.error(f"Sequence update LLM call failed: {e}")
            return emit("error", {"msg": "Failed to update sequence."})

        # Create the Sequence record
        seq = Sequence(conversation_id=conv_id)
        db.session.add(seq)
        db.session.flush()
            
        step_strings = []
        for idx, step in enumerate(sequence_obj.steps):
            step_strings.append(step.explanation)
            step_record = SequenceSteps(
                sequence_id=seq.id,
                step_text=step.explanation,
                step_number=idx + 1
            )
            db.session.add(step_record)
        db.session.commit()

        # Emit updated sequence back to front end
        emit("sequence_retrieved", {
            "sequence": step_strings
        })

        
        if getattr(sequence_obj, "description", None):
            bot_msg = Message(
                conversation_id=conv_id,
                sender="bot",
                content=sequence_obj.description
            )
            db.session.add(bot_msg)
            db.session.commit()
            emit("bot_message", {
                "text": sequence_obj.description,
                "conversationId": conv_id
            })
