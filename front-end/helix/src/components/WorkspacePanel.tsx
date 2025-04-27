import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";

export default function WorkspacePanel() {
	const ctx = useContext(ChatContext);
	if (!ctx) throw new Error("ChatContext must be used within ChatProvider");
	const {
		state: { sequence },
		updateSequence,
	} = ctx;

	const [editableSeq, setEditableSeq] = useState<string[]>(sequence);
	const [newStep, setNewStep] = useState("");
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editingValue, setEditingValue] = useState("");
	const [isEditMode, setIsEditMode] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	useEffect(() => {
		setEditableSeq(sequence);
	}, [sequence]);

	useEffect(() => {
		setHasChanges(JSON.stringify(editableSeq) !== JSON.stringify(sequence));
	}, [editableSeq, sequence]);

	const saveEdits = () => {
		setIsEditMode(!isEditMode);
		updateSequence(editableSeq)};

	const startEdit = (i: number) => {
		setEditingIndex(i);
		setEditingValue(editableSeq[i]);
	};
	const saveEdit = (i: number) => {
		const updated = [...editableSeq];
		updated[i] = editingValue;
		setEditableSeq(updated);
		setEditingIndex(null);
	};
	const deleteStep = (i: number) => {
		const updated = editableSeq.filter((_, idx) => idx !== i);
		setEditableSeq(updated);
	};
	const addStep = () => {
		if (newStep.trim() === "") return;
		const updated = [...editableSeq, newStep.trim()];
		setEditableSeq(updated);
		setNewStep("");
	};

	if (!sequence || sequence.length === 0) {
		return (
			<div className="w-[50%] flex flex-col h-full">
				<div className="flex-1 flex items-center justify-center p-6">
					<p className="text-gray-500">No sequence available for this conversation.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-[50%] flex flex-col h-full">
			<h2 className="text-xl font-bold mb-2 p-6">Workspace</h2>
			<div className="flex-1 overflow-y-auto p-6">
				<div className="border p-4 space-y-4">
					<h3 className="font-semibold">Sequence</h3>
					{editableSeq.map((step, i) => (
						<div
							key={i}
							className="border rounded p-3 flex items-start"
						>
							<div className="flex-1">
								{editingIndex === i ? (
									<>
										<input
											className="w-full border rounded px-2 py-1 mb-2"
											value={editingValue}
											onChange={(e) =>
												setEditingValue(e.target.value)
											}
										/>
										<button
											onClick={() => saveEdit(i)}
											className="text-green-600 mr-2"
										>
											Save
										</button>
										<button
											onClick={() =>
												setEditingIndex(null)
											}
											className="text-gray-600"
										>
											Cancel
										</button>
									</>
								) : (
									<>
										<strong>Step {i + 1}:</strong>
										<p className="mt-1 whitespace-pre-wrap">
											{step}
										</p>
									</>
								)}
							</div>
							{isEditMode && editingIndex !== i && (
								<div className="ml-4 flex-shrink-0 space-x-2">
									<button
										onClick={() => startEdit(i)}
										className="text-blue-600"
									>
										Edit
									</button>
									<button
										onClick={() => deleteStep(i)}
										className="text-red-600"
									>
										Delete
									</button>
								</div>
							)}
						</div>
					))}
					{isEditMode && (
						<div className="mt-4 flex space-x-2">
							<input
								className="flex-1 border rounded px-2 py-1"
								placeholder="New step text..."
								value={newStep}
								onChange={(e) => setNewStep(e.target.value)}
							/>
							<button
								onClick={addStep}
								className="bg-green-500 text-white px-4 py-2 rounded-4xl"
							>
								Add Step
							</button>
						</div>
					)}
				</div>
			</div>
			<div className="ml-auto p-2 pl-6">
				<button
					className={`bg-gray-300 text-gray-800 px-4 py-2 rounded-4xl mr-2 cursor-pointer transition-colors ${
						isEditMode ? "hover:bg-red-500" : " hover:bg-green-500"
					} hover:bg-green-500`}
					onClick={() => setIsEditMode(!isEditMode)}
				>
					{isEditMode ? "Cancel" : "Edit"}
				</button>
				<button
					onClick={saveEdits}
					disabled={!isEditMode || !hasChanges}
					className={`bg-blue-500 text-white px-4 py-2 rounded-4xl transition-colors 
						${
							!isEditMode || !hasChanges
								? "opacity-50 cursor-not-allowed"
								: "hover:bg-blue-600"
						}`}
				>
					Save
				</button>
			</div>
		</div>
	);
}
