/* eslint-disable react-refresh/only-export-components */
import { createContext, useReducer, useEffect, ReactNode } from "react";
import { chatReducer, initialState, Message, Conversation } from "./chatReducer";
import useSocket from "../hooks/useSocket";

interface ChatContextType {
	state: typeof initialState;
	createConversation: () => void;
	selectConversation: (id: string) => void;
	sendMessage: (text: string) => void;
	updateSequence: (seq: string[]) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(
	undefined
);

export function ChatProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(chatReducer, initialState);
	const socket = useSocket();

	useEffect(() => {
		if (!socket) return;
		//fetch all conversations
		socket.emit("get_conversations");

		//conversation list fetched
		socket.on("conversation_list", (list: Conversation[]) =>
			dispatch({ type: "SET_CONVERSATIONS", payload: list })
		);

		// new conversation created
		socket.on(
			"conversation_created",
			(conversationData: Conversation) => {
				dispatch({
					type: "ADD_CONVERSATION",
					payload: conversationData,
				});
				dispatch({ type: "SET_CURRENT_CONVERSATION", payload: conversationData.id });
			}
		);

		//Fetch conversation messages
		socket.on("conversation_messages", ({ messages }: { messages: Message[] }) => {
			dispatch({ type: "SET_MESSAGES", payload: messages });
		});

		// incoming bot message
		socket.on(
			"bot_message",
			({
				text,
				conversationId,
			}: {
				text: string;
				conversationId: string;
			}) => {
				dispatch({
					type: "DELETE_MESSAGE",})
				dispatch({
					type: "ADD_MESSAGE",
					payload: {
						id: Date.now(),
						from: "bot",
						text,
						conversationId,
					} as Message,
				});
			}
		);

		socket.on(
			"sequence_retrieved",
			({ sequence }: { sequence: string[] }) => {
				dispatch({ type: "SET_SEQUENCE", payload: sequence });
			}
		);

		socket.on(
			"conversation_title_updated",
			(data: { conversationId: string; title: string }) => {
				dispatch({
					type: "UPDATE_CONVERSATION_TITLE",
					payload: {
						conversationId: data.conversationId,
						title: data.title,
					},
				});
			}
		);

		return () => {
			socket.off("conversation_list");
			socket.off("conversation_messages");
			socket.off("bot_message");
			socket.off("conversation_title_updated");
			socket.off("sequence_retrieved");
			socket.off("conversation_created");
		};
	}, [socket]);

	const createConversation = () => {
		socket?.emit("new_conversation");
	};

	const selectConversation = (id: string) => {
		dispatch({ type: "SET_CURRENT_CONVERSATION", payload: id });
		socket?.emit("select_conversation", { conversationId: id });
		socket?.emit("get_sequences", { conversationId: id });
	};

	const sendMessage = (text: string) => {
		if (!state.currentConversationId) {
			console.warn(
				"Cannot send message, no current conversation selected."
			);
			return;
		}

		const messagesForCurrentConv = state.messages.filter(
			(m) => m.conversationId === state.currentConversationId
		);
		const isFirstMessage = messagesForCurrentConv.length === 0;
		
		if (isFirstMessage) {
			socket?.emit("update_conversation_title", {
				conversationId: state.currentConversationId,
				message: text
			});
		}
		
		const msg = {
			id: Date.now(),
			from: "user" as const,
			text,
			conversationId: state.currentConversationId,
		};
		dispatch({
			type: "ADD_MESSAGE",
			payload: msg,
		});
		dispatch({
			type: "ADD_MESSAGE",
			payload: {
				id: Date.now() + 1,
				from: "bot" as const,
				text: "Thinking...",
				conversationId: state.currentConversationId,
			} as Message,
		});
		
		socket?.emit("user_message", msg);
	};

	const updateSequence = (seq: string[]) => {
		dispatch({ type: "SET_SEQUENCE", payload: seq });
		if (state.currentConversationId) {
			socket?.emit("update_sequence", {
				conversationId: state.currentConversationId,
				sequence: seq,
			});
		}
	};

	return (
		<ChatContext.Provider
			value={{
				state,
				createConversation,
				selectConversation,
				sendMessage,
				updateSequence,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
}
