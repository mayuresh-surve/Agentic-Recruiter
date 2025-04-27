import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

export default function ConversationListPanel() {
	const ctx = useContext(ChatContext);
	if (!ctx) throw new Error("Must be inside ChatProvider");
	const {
		state: { conversations, currentConversationId },
		createConversation,
		selectConversation,
	} = ctx;

	return (
		<div className="w-[20%] border-r border-gray-300 flex flex-col h-full">
			<h2 className="p-4 font-bold text-xl">Conversations</h2>
			<button
				onClick={createConversation}
				className="m-2 px-2 py-2 bg-green-500 text-white rounded"
			>
				+ New Conversation
			</button>
			<div className="flex-1 overflow-y-auto">
				{conversations.map((conv) => (
					<div
						key={conv.id}
						onClick={() => selectConversation(conv.id)}
						className={`p-2 cursor-pointer ${
							conv.id === currentConversationId
								? "bg-blue-100"
								: "hover:bg-gray-100"
						}`}
					>
						{conv.name}
					</div>
				))}
			</div>
		</div>
	);
}
