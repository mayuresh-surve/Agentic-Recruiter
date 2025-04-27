export interface Message {
	id: number;
	from: "user" | "bot";
	text: string;
	conversationId: string;
}

export interface ChatState {
	conversations: { id: string; name: string }[];
	currentConversationId: string | null;
	messages: Message[];
	sequence: string[];
}

export type ChatAction =
	| { type: "SET_CONVERSATIONS"; payload: { id: string; name: string }[] }
	| { type: "ADD_CONVERSATION"; payload: { id: string; name: string } }
	| { type: "SET_CURRENT_CONVERSATION"; payload: string }
	| { type: "SET_MESSAGES"; payload: Message[] }
	| { type: "ADD_MESSAGE"; payload: Message }
	| { type: "SET_SEQUENCE"; payload: string[] };

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
		default:
			return state;
	}
}
