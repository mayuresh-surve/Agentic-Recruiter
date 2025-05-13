# app/sockets/messages.py

from flask import session as flask_session, current_app
from flask_socketio import emit
from ..extensions import socketio, db
from ..models import Message, User
from app.services import save_message, get_history, create_sequence, get_latest_sequence
from ..llm.client import complete as ask_llm
from ..llm.prompts import PLANNER_PROMPT, SEQUENCE_GENERATOR_PROMPT, UPDATE_SEQUENCE_PROMPT
from ..llm.schemas import AskResponse, SequenceResponse


@socketio.on("user_message")
def handle_user_message(data):
    """
    Persist user message, call LLM, save bot reply, and emit back.
    """
    conv_id = data.get("conversationId")
    user_id = flask_session.get("user_id")
    text = data.get("text")
    if not conv_id or text is None:
        return emit("error", {"msg": "Invalid payload for user_message"})

    emit("loading_state", {"text": "Thinking...", "conversationId": conv_id})
    
    try:
        save_message(int(conv_id), text, "user")
    except Exception as e:
        current_app.logger.error(f"DB error saving user message: {e}")
        return emit("error", {"msg": "Failed to save user message"})
    
    history = get_history(conv_id)
    messages = []
    for msg in history:
        role = "assistant" if msg["from"] == "bot" else "user"
        messages.append({"role": role, "content": msg["text"]})
    
    user = User.query.get(user_id)
    system_prompt = PLANNER_PROMPT.format(
        company_name=user.company_name, user_role=user.role, industry=user.industry, roles_hire=user.roles_hire)

    try:
        response_obj = ask_llm(
            messages, output_format=AskResponse, instructions=system_prompt)
        response_message: AskResponse = AskResponse.model_validate(response_obj)
    except Exception as e:
        current_app.logger.error(f"LLM call failed: {e}")
        return emit("error", {"msg": "LLM error"})

    if response_message and not response_message.ready_for_executions:
        save_message(int(conv_id), response_message.next_step, "bot")
        emit("bot_message", {
             "text": response_message.next_step, "conversationId": conv_id})
    elif response_message and response_message.ready_for_executions and not response_message.is_update_sequence:
        sequence_messages = [{
            "role": "user", "content": response_message.next_step + "\nInformation available for you to work on the task:\n" + response_message.information_gathered
        }]
        emit("loading_state", {
             "text": "Creating a Sequence...", "conversationId": conv_id})
        try:
            sequence_response = ask_llm(
                sequence_messages, output_format=SequenceResponse, instructions=SEQUENCE_GENERATOR_PROMPT, temperature=0.5)
            sequence_obj: SequenceResponse = SequenceResponse.model_validate(
                sequence_response)
        except Exception as e:
            current_app.logger.error(f"LLM call failed: {e}")
            return emit("error", {"msg": "Failed to generate sequence."})
        
        if sequence_obj and sequence_obj.steps:
            step_strings = []
            for i, step in enumerate(sequence_obj.steps):
                step_strings.append(step.explanation)

            emit("sequence_retrieved", {
                "sequence": step_strings
            })
            
            try:
                seq = create_sequence(int(conv_id), step_strings)
            except Exception as e:
                return emit("error", {"msg": "Failed to update sequence"})
        else:
            emit("sequence_retrieved", {
                "sequence": []
            })
        if sequence_obj and sequence_obj.description:
            save_message(int(conv_id), sequence_obj.description, "bot")
            emit("bot_message", {
                "text": sequence_obj.description,
                "conversationId": conv_id
            })
    
    elif response_message and response_message.ready_for_executions and response_message.is_update_sequence:
        latest_sequence = get_latest_sequence(int(conv_id))
        existing_sequence_text = "\n".join(
            f"{idx+1}. {step_text}" for idx, step_text in enumerate(latest_sequence)
        )
        sequence_update_messages = [
            {"role": "user", "content": f"{response_message.next_step} \n\n Current plan:\n{existing_sequence_text}"},
        ]
        emit("loading_state", {
             "text": "Updating a Sequence...", "conversationId": conv_id})
        try:
            seq_resp = ask_llm(
                sequence_update_messages,
                output_format=SequenceResponse,
                instructions=UPDATE_SEQUENCE_PROMPT,
                temperature=0.5
            )
            sequence_obj: SequenceResponse = SequenceResponse.model_validate(
                seq_resp)
        except Exception as e:
            current_app.logger.error(f"Sequence update LLM call failed: {e}")
            return emit("error", {"msg": "Failed to update sequence."})

        if sequence_obj and sequence_obj.steps:
            step_strings = []
            for i, step in enumerate(sequence_obj.steps):
                step_strings.append(step.explanation)

            emit("sequence_retrieved", {
                "sequence": step_strings
            })

            try:
                seq = create_sequence(int(conv_id), step_strings)
            except Exception as e:
                return emit("error", {"msg": "Failed to update sequence"})
        else:
            emit("sequence_retrieved", {
                "sequence": []
            })
        if sequence_obj and sequence_obj.description:
            save_message(int(conv_id), sequence_obj.description, "bot")
            emit("bot_message", {
                "text": sequence_obj.description,
                "conversationId": conv_id
            })
