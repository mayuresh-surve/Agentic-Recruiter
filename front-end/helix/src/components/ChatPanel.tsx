import { useContext, useState, useRef, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { Message } from "../context/chatReducer";
import { SendHorizontal, UserCircle, Bot, MessageSquareText } from "lucide-react";
// export default function ChatPanel() {
// 	const ctx = useContext(ChatContext);
// 	if (!ctx) throw new Error("ChatContext must be used within ChatProvider");
// 	const {
// 		state: { messages, currentConversationId },
// 		sendMessage,
// 	} = ctx;

// 	const [input, setInput] = useState("");
// 	const endRef = useRef<HTMLDivElement | null>(null);
// 	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

// 	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
// 		setInput(e.target.value);
// 		if (textareaRef.current) {
// 			const el = textareaRef.current;
// 			el.style.height = 'auto';
// 			const lineHeight = parseInt(getComputedStyle(el).lineHeight);
// 			const maxHeight = lineHeight * 5;
// 			const newHeight = Math.min(el.scrollHeight, maxHeight);
// 			el.style.height = `${newHeight}px`;
// 			el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
// 		}
// 	};

// 	useEffect(() => {
// 		endRef.current?.scrollIntoView({ behavior: "smooth" });
// 	}, [messages]);

// 	if (!currentConversationId) {
// 		return (
// 			<div className="w-[30%] flex items-center justify-center">
// 				<p className="text-gray-500">
// 					Select or start a conversation.
// 				</p>
// 			</div>
// 		);
// 	}

// 	const onSend = () => {
// 		if (!input.trim()) return;
// 		sendMessage(input.trim());
// 		setInput("");
// 		if (textareaRef.current) {
// 			const el = textareaRef.current;
// 			el.style.height = 'auto';
// 			el.style.overflowY = 'hidden';
// 		}
// 	};

// 	return (
// 		<div className="w-[45%] border-r border-gray-300 flex flex-col h-full">
// 			<div className="flex-1 p-4 overflow-y-auto flex flex-col">
// 				{messages.map((m: Message) => (
// 					<div key={m.id} className="my-2 flex w-full">
// 						{m.from === "user" ? (
// 							<div className="p-2 rounded-xl max-w-xs ml-auto bg-blue-100">
// 								{m.text}
// 							</div>
// 						) : (
// 							<div className="p-2 rounded-xl max-w-xs bg-gray-200">
// 								{m.text}
// 							</div>
// 						)}
// 					</div>
// 				))}
// 				<div ref={endRef} />
// 			</div>
// 			<div className="p-4 flex items-center space-x-2">
// 				<textarea
// 					ref={textareaRef}
// 					rows={1}
// 					className="flex-1 border rounded px-3 py-2 focus:outline-none resize-none overflow-hidden"
// 					value={input}
// 					onChange={handleInputChange}
// 					onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), onSend())}
// 					placeholder="Type a message…"
// 				/>
// 				<button
// 					className="bg-blue-500 text-white px-4 rounded-4xl py-2 hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
// 					onClick={onSend}
// 				>
// 					Send
// 				</button>
// 			</div>
// 		</div>
// 	); 
// }

export default function ChatPanel() {
	// Use actual ChatContext if available, otherwise fall back to MockChatContext
	const contextToUse = ChatContext;
	const ctx = useContext(contextToUse);

	// Refs for scrolling and textarea auto-resize
	const endRef = useRef<HTMLDivElement | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [input, setInput] = useState("");

	// Scroll to the bottom of the messages list when new messages are added
	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [ctx?.state.messages]);

	// Auto-resize textarea height based on content
	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
		if (textareaRef.current) {
			const el = textareaRef.current;
			el.style.height = "auto"; // Reset height to auto to correctly calculate scrollHeight
			const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 20; // Default line height
			const maxHeight = lineHeight * 6; // Max height for 6 lines
			const newHeight = Math.min(el.scrollHeight, maxHeight);
			el.style.height = `${newHeight}px`;
			el.style.overflowY =
				el.scrollHeight > maxHeight ? "auto" : "hidden";
		}
	};

	// Handle context unavailability
	if (!ctx) {
		console.error(
			"ChatPanel: Context is null. Ensure it's wrapped in a Provider (ChatProvider or MockChatProvider for demo)."
		);
		return (
			<div className="flex-1 flex items-center justify-center p-6 bg-slate-50 border-r border-slate-200">
				<div className="text-center">
					<MessageSquareText
						size={48}
						className="mx-auto text-slate-400 mb-3"
					/>
					<p className="text-slate-600 font-medium">
						Chat Context Not Available
					</p>
					<p className="text-xs text-slate-500 mt-1">
						Please ensure the ChatPanel is within a ChatProvider.
					</p>
				</div>
			</div>
		);
	}

	const {
		state: { messages, currentConversationId },
		sendMessage,
	} = ctx;

	// Display a message if no conversation is selected
	if (!currentConversationId) {
		return (
			<div className="flex-1 flex items-center justify-center p-6 bg-slate-50 border-r border-slate-200">
				<div className="text-center">
					<MessageSquareText
						size={48}
						className="mx-auto text-slate-400 mb-3"
					/>
					<p className="text-slate-600 font-medium">
						No Conversation Selected
					</p>
					<p className="text-xs text-slate-500 mt-1">
						Select a conversation from the list or start a new one.
					</p>
				</div>
			</div>
		);
	}

	// Function to handle sending a message
	const onSend = () => {
		if (!input.trim()) return;
		sendMessage(input.trim());
		setInput("");
		// Reset textarea height after sending
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.overflowY = "hidden";
			textareaRef.current.focus();
		}
	};

	return (
		// Main container for the chat panel
		<div className="w-full md:w-[50%] lg:w-[55%] xl:w-[60%] flex flex-col h-full bg-white border-r border-slate-200 shadow-sm font-sans">
			{/* Header for the current conversation (optional, can be added if needed) */}
			{/* <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-700">Chat with Bot</h3>
            </div> */}

			{/* Messages area */}
			<div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto bg-slate-50">
				{messages.map((m: Message) => (
					<div
						key={m.id}
						className={`flex items-end gap-2 ${
							m.from === "user" ? "justify-end" : "justify-start"
						}`}
					>
						{/* Avatar for non-user messages */}
						{m.from !== "user" && (
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-white">
								<Bot size={18} />
							</div>
						)}

						{/* Message bubble */}
						<div
							className={`
                                p-3 rounded-xl max-w-md md:max-w-lg lg:max-w-xl shadow-sm
                                ${
									m.from === "user"
										? "bg-sky-500 text-white rounded-br-none"
										: "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
								}
                            `}
						>
							<p className="text-sm whitespace-pre-wrap">
								{m.text}
							</p>
						</div>

						{/* Avatar for user messages */}
						{m.from === "user" && (
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white">
								<UserCircle size={18} />
							</div>
						)}
					</div>
				))}
				{/* Invisible div to help scroll to the bottom */}
				<div ref={endRef} />
			</div>

			{/* Input area */}
			<div className="p-3 md:p-4 border-t border-slate-200 bg-white">
				<div className="flex items-end space-x-2">
					<textarea
						ref={textareaRef}
						rows={1}
						className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 resize-none text-sm bg-slate-50 placeholder-slate-400"
						value={input}
						onChange={handleInputChange}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault(); // Prevent newline on Enter
								onSend();
							}
						}}
						placeholder="Type your message…"
						aria-label="Chat message input"
					/>
					<button
						className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={onSend}
						disabled={!input.trim()}
						aria-label="Send message"
					>
						<SendHorizontal size={20} />
					</button>
				</div>
			</div>
		</div>
	);
}