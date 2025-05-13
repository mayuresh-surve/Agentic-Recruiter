export interface Message {
	id: number;
	from: "user" | "bot";
	text: string;
	conversationId: string;
}

export interface Conversation {
	id: string;
	name: string;
}

export interface ChatState {
	conversations: Conversation[];
	currentConversationId: string | null;
	messages: Message[];
	sequence: string[];
}

export type ChatAction =
	| { type: "SET_CONVERSATIONS"; payload: Conversation[] }
	| { type: "ADD_CONVERSATION"; payload: Conversation }
	| { type: "SET_CURRENT_CONVERSATION"; payload: string }
	| { type: "SET_MESSAGES"; payload: Message[] }
	| { type: "ADD_MESSAGE"; payload: Message }
	| { type: "SET_SEQUENCE"; payload: string[] }
	| { type: "DELETE_MESSAGE" }
	| {
			type: "UPDATE_CONVERSATION_TITLE";
			payload: { conversationId: string; title: string };
	  };

export const initialState: ChatState = {
	conversations: [],
	currentConversationId: null,
	messages: [],
	sequence: [],
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
	switch (action.type) {
		case "SET_CONVERSATIONS":
			return { ...state, conversations: action.payload };
		case "ADD_CONVERSATION":
			if (state.conversations.find((c) => c.id === action.payload.id)) {
				return state;
			}
			return {
				...state,
				conversations: [...state.conversations, action.payload],
			};
		case "SET_CURRENT_CONVERSATION":
			return {
				...state,
				currentConversationId: action.payload,
				sequence: [],
				messages: [],
			};
		case "ADD_MESSAGE":
			return {
				...state,
				messages: [...state.messages, action.payload],
			};
		case "DELETE_MESSAGE":
			return {
				...state,
				messages: state.messages.filter(
					(message) => message.text !== "Thinking..."
				),
			};
		case "SET_MESSAGES":
			return {
				...state,
				messages: action.payload,
			};
		case "SET_SEQUENCE":
			return {
				...state,
				sequence: action.payload,
			};
		case "UPDATE_CONVERSATION_TITLE":
			return {
				...state,
				conversations: state.conversations.map((conversation) =>
					conversation.id === action.payload.conversationId
						? { ...conversation, name: action.payload.title }
						: conversation
				),
			};
		default:
			return state;
	}
}
