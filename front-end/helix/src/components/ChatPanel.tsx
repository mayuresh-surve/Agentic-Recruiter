import { useContext, useState, useRef, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { Message } from "../context/chatReducer";

export default function ChatPanel() {
	const ctx = useContext(ChatContext);
	if (!ctx) throw new Error("ChatContext must be used within ChatProvider");
	const {
		state: { messages, currentConversationId },
		sendMessage,
	} = ctx;

	const [input, setInput] = useState("");
	const endRef = useRef<HTMLDivElement | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
		if (textareaRef.current) {
			const el = textareaRef.current;
			el.style.height = 'auto';
			const lineHeight = parseInt(getComputedStyle(el).lineHeight);
			const maxHeight = lineHeight * 5;
			const newHeight = Math.min(el.scrollHeight, maxHeight);
			el.style.height = `${newHeight}px`;
			el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
		}
	};

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	if (!currentConversationId) {
		return (
			<div className="w-[30%] flex items-center justify-center">
				<p className="text-gray-500">
					Select or start a conversation.
				</p>
			</div>
		);
	}

	const onSend = () => {
		if (!input.trim()) return;
		sendMessage(input.trim());
		setInput("");
		if (textareaRef.current) {
			const el = textareaRef.current;
			el.style.height = 'auto';
			el.style.overflowY = 'hidden';
		}
	};

	return (
		<div className="w-[30%] border-r border-gray-300 flex flex-col h-full">
			<h2 className="p-4 font-bold text-xl">Chat</h2>
			<div className="flex-1 p-4 overflow-y-auto flex flex-col">
				{messages.map((m: Message) => (
					<div key={m.id} className="my-2 flex w-full">
						{m.from === "user" ? (
							<div className="p-2 rounded-xl max-w-xs ml-auto bg-blue-100">
								{m.text}
							</div>
						) : (
							<div className="p-2 rounded-xl max-w-xs bg-gray-200">
								{m.text}
							</div>
						)}
					</div>
				))}
				<div ref={endRef} />
			</div>
			<div className="p-4 flex items-center space-x-2">
				<textarea
					ref={textareaRef}
					rows={1}
					className="flex-1 border rounded px-3 py-2 focus:outline-none resize-none overflow-hidden"
					value={input}
					onChange={handleInputChange}
					onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), onSend())}
					placeholder="Type a message…"
				/>
				<button
					className="bg-blue-500 text-white px-4 rounded-4xl py-2 hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
					onClick={onSend}
				>
					Send
				</button>
			</div>
		</div>
	); 
}
