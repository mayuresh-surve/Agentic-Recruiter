import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { PlusCircle, MessageSquareText } from "lucide-react";

// export default function ConversationListPanel() {
// 	const ctx = useContext(ChatContext);
// 	if (!ctx) throw new Error("Must be inside ChatProvider");
// 	const {
// 		state: { conversations, currentConversationId },
// 		createConversation,
// 		selectConversation,
// 	} = ctx;

// 	return (
// 		<div className="w-[15%] border-r border-gray-300 flex flex-col h-full">
// 			<h2 className="p-4 font-bold text-xl">Conversations</h2>
// 			<button
// 				onClick={createConversation}
// 				className="m-2 px-2 py-2 bg-green-500 text-white rounded"
// 			>
// 				+ New Conversation
// 			</button>
// 			<div className="flex-1 overflow-y-auto">
// 				{conversations.map((conv) => (
// 					<div
// 						key={conv.id}
// 						onClick={() => selectConversation(conv.id)}
// 						className={`p-2 cursor-pointer ${
// 							conv.id === currentConversationId
// 								? "bg-blue-100"
// 								: "hover:bg-gray-100"
// 						}`}
// 					>
// 						{conv.name}
// 					</div>
// 				))}
// 			</div>
// 		</div>
// 	);
// }

export default function ConversationListPanel() {
	// Assuming ChatContext is the actual context you want to use.
	// If you needed a mock fallback, it would be:
	// const contextToUse = ChatContext || MockChatContext;
	const ctx = useContext(ChatContext);

	// Ensure the context (ctx) is available.
	if (!ctx) {
		console.error(
			"ConversationListPanel: Context is null. " +
				"This usually means the component is not wrapped in a relevant Provider."
		);
		// Fallback UI when context is not available
		return (
			<div className="w-full md:w-[25%] lg:w-[20%] xl:w-[15%] p-4 border-r border-gray-200 bg-gray-50 flex flex-col h-full shadow-sm">
				{" "}
				{/* MODIFIED: h-screen to h-full */}
				<h2 className="font-semibold text-xl text-slate-800 tracking-tight p-4 border-b border-slate-200">
					Conversations
				</h2>
				<div className="p-4 text-center">
					<p className="text-red-500 text-sm">
						Error: Chat context is not available.
					</p>
					<p className="text-xs text-slate-500 mt-1">
						Please ensure this component is wrapped in a
						ChatProvider.
					</p>
				</div>
			</div>
		);
	}

	// Destructure state and functions from the context
	const {
		state: { conversations, currentConversationId },
		createConversation,
		selectConversation,
	} = ctx;

	return (
		// Main container for the conversation list panel
		<div className="w-full md:w-[25%] lg:w-[20%] xl:w-[15%] bg-slate-50 border-r border-slate-200 flex flex-col shadow-sm font-sans h-full">
			{/* Button to create a new conversation */}
			<div className="p-3">
				<button
					onClick={createConversation}
					className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 active:bg-sky-700"
					aria-label="Create new chat"
				>
					<PlusCircle size={20} aria-hidden="true" />
					<span className="font-medium">New Chat</span>
				</button>
			</div>
			{/* List of conversations - this div handles its own scrolling */}
			<div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
				{conversations.map((conv) => (
					<div
						key={conv.id}
						onClick={() => selectConversation(conv.id)}
						className={`
                            flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-150 ease-in-out group
                            ${
								conv.id === currentConversationId
									? "bg-sky-100 text-sky-700 shadow-sm" // Active conversation
									: "text-slate-600 hover:bg-slate-100 hover:text-slate-800" // Inactive conversation
							}
                        `}
						role="button"
						tabIndex={0}
						onKeyPress={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								selectConversation(conv.id);
							}
						}}
						aria-current={
							conv.id === currentConversationId
								? "page"
								: undefined
						}
					>
						<MessageSquareText
							size={18}
							aria-hidden="true"
							className={`
                                transition-colors duration-150 ease-in-out
                                ${
									conv.id === currentConversationId
										? "text-sky-600"
										: "text-slate-400 group-hover:text-slate-500"
								}
                            `}
						/>
						<span className="truncate font-medium text-sm">
							{conv.name || `Conversation ${conv.id}`}
						</span>
					</div>
				))}
				{conversations.length === 0 && (
					<div className="p-4 text-center text-slate-500">
						<MessageSquareText
							size={32}
							className="mx-auto mb-2 text-slate-400"
							aria-hidden="true"
						/>
						<p className="text-sm">No conversations yet.</p>
						<p className="text-xs mt-1">
							Click "+ New Chat" to start one!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}