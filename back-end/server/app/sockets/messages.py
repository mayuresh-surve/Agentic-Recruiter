# app/sockets/messages.py

from flask import session as flask_session, current_app
from flask_socketio import emit
from ..extensions import socketio, db
from ..models import Message, User
from app.services import save_message, get_history, create_sequence, get_latest_sequence
from ..llm.client import complete as ask_llm
from ..llm.prompts import PLANNER_PROMPT, SEQUENCE_GENERATOR_PROMPT, UPDATE_SEQUENCE_PROMPT
from ..llm.schemas import AskResponse, SequenceResponse

def _validate_payload(data):
    conv_id = data.get("conversationId")
    text = data.get("text")
    user_id = flask_session.get("user_id")

    if not all([conv_id, text, user_id]):
        emit("error", {"msg": "Invalid payload or missing session data."})
        return None, None, None, None  # Or raise an exception

    try:
        conversation_id_int = int(conv_id)
    except ValueError:
        emit("error", {"msg": "Invalid conversationId format."})
        return None, None, None, None

    user = User.query.get(user_id)
    if not user:
        # Log sensitive details server-side
        emit("error", {"msg": "User not found."})
        return None, None, None, None

    return conversation_id_int, text, user_id, user


# Add user_id for auth check in get_history
def _get_formatted_history(conv_id, user_id):
    # Potentially add authorization check: Does user_id have access to conv_id?
    # Assuming get_history handles auth or is called safely
    history = get_history(conv_id)
    messages = [{"role": "assistant" if msg["from"] ==
                 "bot" else "user", "content": msg["text"]} for msg in history]
    return messages


def _call_planner_llm(messages, user_details):
    system_prompt = PLANNER_PROMPT.format(
        company_name=user_details.company_name, user_role=user_details.role,
        industry=user_details.industry, roles_hire=user_details.roles_hire
    )
    response_obj =  ask_llm(
        messages, output_format=AskResponse, instructions=system_prompt)
    return AskResponse.model_validate(response_obj)


def _handle_llm_response_not_ready(conv_id, response_message_text):
    save_message(conv_id, response_message_text, "bot")
    emit("bot_message", {"text": response_message_text,
         "conversationId": str(conv_id)})


def _process_sequence_llm_result(conv_id, sequence_obj):
    """Handles saving sequence, emitting events for both new and updated sequences."""
    if not sequence_obj:
        emit("sequence_retrieved", {"sequence": []})
        # Potentially save a generic bot message saying sequence generation failed
        return

    step_strings = []
    if sequence_obj.steps:
        step_strings = [step.explanation for step in sequence_obj.steps]

    emit("sequence_retrieved", {"sequence": step_strings})

    try:
        if step_strings:  # Only create sequence if there are steps
            create_sequence(conv_id, step_strings)
    except Exception as e:
        current_app.logger.error(
            f"DB error saving sequence for conv {conv_id}: {e}")
        # This error is critical for sequence creation; the client already got sequence_retrieved
        # Maybe emit a specific error related to saving the sequence if it differs from LLM generation error
        emit("error", {"msg": "Failed to save the generated sequence steps."})
        # Or, if create_sequence raises a custom error, catch that and handle more gracefully

    if sequence_obj.description:
        save_message(conv_id, sequence_obj.description, "bot")
        emit("bot_message", {
             "text": sequence_obj.description, "conversationId": str(conv_id)})
    elif not step_strings and not sequence_obj.description:  # No steps and no description
        # Consider emitting a message indicating that no sequence could be generated
        # For now, this means sequence_retrieved was empty and no bot_message.
        pass


def _handle_new_sequence_generation(conv_id, planner_response: AskResponse):
    sequence_messages = [{
        "role": "user",
        "content": planner_response.next_step + "\nInformation available for you to work on the task:\n" + planner_response.information_gathered
    }]
    try:
        sequence_response_raw =  ask_llm(
            sequence_messages, output_format=SequenceResponse,
            instructions=SEQUENCE_GENERATOR_PROMPT, temperature=0.5
        )
        sequence_obj = SequenceResponse.model_validate(sequence_response_raw)
        _process_sequence_llm_result(conv_id, sequence_obj)
    except Exception as e:
        current_app.logger.error(
            f"LLM call for new sequence failed for conv {conv_id}: {e}")
        # Generic error to client
        emit("error", {"msg": "Failed to generate sequence."})


def _handle_sequence_update(conv_id, planner_response: AskResponse):
    # Assuming this returns a list of strings
    latest_sequence_steps = get_latest_sequence(conv_id)
    existing_sequence_text = "\n".join(
        f"{idx+1}. {step_text}" for idx, step_text in enumerate(latest_sequence_steps)
    )
    sequence_update_messages = [
        {"role": "user", "content": f"{planner_response.next_step} \n\n Current plan:\n{existing_sequence_text}"},
    ]
    try:
        sequence_response_raw = ask_llm(
            sequence_update_messages, output_format=SequenceResponse,
            instructions=UPDATE_SEQUENCE_PROMPT, temperature=0.5
        )
        sequence_obj = SequenceResponse.model_validate(sequence_response_raw)
        _process_sequence_llm_result(conv_id, sequence_obj)
    except Exception as e:
        current_app.logger.error(
            f"LLM call for sequence update failed for conv {conv_id}: {e}")
        emit("error", {"msg": "Failed to update sequence."})


@socketio.on("user_message")
def handle_user_message(data):
    conv_id_int, text, user_id, user_obj = _validate_payload(data)
    if not conv_id_int:  # Validation failed, error already emitted
        return

    try:
        save_message(conv_id_int, text, "user")
    except Exception as e:
        current_app.logger.error(
            f"DB error saving user message for conv {conv_id_int}: {e}")
        return emit("error", {"msg": "Failed to save user message"})

    try:
        # Pass user_id for potential auth in get_history
        history_messages = _get_formatted_history(conv_id_int, user_id)
        planner_response =  _call_planner_llm(history_messages, user_obj)

        if not planner_response.ready_for_executions:
            _handle_llm_response_not_ready(
                conv_id_int, planner_response.next_step)
        elif planner_response.is_update_sequence: 
             _handle_sequence_update(conv_id_int, planner_response)
        else:  # ready_for_executions and not is_update_sequence
            _handle_new_sequence_generation(conv_id_int, planner_response)

    except Exception as e:  # Catch errors from LLM calls or subsequent processing
        current_app.logger.error(
            f"Core processing error for conv {conv_id_int}: {e}")
        # This is a general catch-all. Specific errors from LLM calls are handled in their respective functions.
        # This might catch errors from _process_sequence_llm_result if re-raised.
        return emit("error", {"msg": "An unexpected error occurred while processing your request."})
