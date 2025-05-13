import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import {
	Edit3,
	Trash2,
	PlusCircle,
	CheckCircle,
	XCircle,
	Save,
	AlertTriangle,
	ListChecks,
} from "lucide-react";
// export default function WorkspacePanel() {
// 	const ctx = useContext(ChatContext);
// 	if (!ctx) throw new Error("ChatContext must be used within ChatProvider");
// 	const {
// 		state: { sequence },
// 		updateSequence,
// 	} = ctx;

// 	const [editableSeq, setEditableSeq] = useState<string[]>(sequence);
// 	const [newStep, setNewStep] = useState("");
// 	const [editingIndex, setEditingIndex] = useState<number | null>(null);
// 	const [editingValue, setEditingValue] = useState("");
// 	const [isEditMode, setIsEditMode] = useState(false);
// 	const [hasChanges, setHasChanges] = useState(false);
// 	useEffect(() => {
// 		setEditableSeq(sequence);
// 	}, [sequence]);

// 	useEffect(() => {
// 		setHasChanges(JSON.stringify(editableSeq) !== JSON.stringify(sequence));
// 	}, [editableSeq, sequence]);

// 	const saveEdits = () => {
// 		setIsEditMode(!isEditMode);
// 		updateSequence(editableSeq)};

// 	const startEdit = (i: number) => {
// 		setEditingIndex(i);
// 		setEditingValue(editableSeq[i]);
// 	};
// 	const saveEdit = (i: number) => {
// 		const updated = [...editableSeq];
// 		updated[i] = editingValue;
// 		setEditableSeq(updated);
// 		setEditingIndex(null);
// 	};
// 	const deleteStep = (i: number) => {
// 		const updated = editableSeq.filter((_, idx) => idx !== i);
// 		setEditableSeq(updated);
// 	};
// 	const addStep = () => {
// 		if (newStep.trim() === "") return;
// 		const updated = [...editableSeq, newStep.trim()];
// 		setEditableSeq(updated);
// 		setNewStep("");
// 	};

// 	if (!sequence || sequence.length === 0) {
// 		return (
// 			<div className="w-[50%] flex flex-col h-full">
// 				<div className="flex-1 flex items-center justify-center p-6">
// 					<p className="text-gray-500">No sequence available for this conversation.</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="w-[40%] flex flex-col h-full">
// 			<h2 className="text-xl font-bold mb-2 p-6">Workspace</h2>
// 			<div className="flex-1 overflow-y-auto p-6">
// 				<div className="border p-4 space-y-4">
// 					<h3 className="font-semibold">Sequence</h3>
// 					{editableSeq.map((step, i) => (
// 						<div
// 							key={i}
// 							className="border rounded p-3 flex items-start"
// 						>
// 							<div className="flex-1">
// 								{editingIndex === i ? (
// 									<>
// 										<input
// 											className="w-full border rounded px-2 py-1 mb-2"
// 											value={editingValue}
// 											onChange={(e) =>
// 												setEditingValue(e.target.value)
// 											}
// 										/>
// 										<button
// 											onClick={() => saveEdit(i)}
// 											className="text-green-600 mr-2"
// 										>
// 											Save
// 										</button>
// 										<button
// 											onClick={() =>
// 												setEditingIndex(null)
// 											}
// 											className="text-gray-600"
// 										>
// 											Cancel
// 										</button>
// 									</>
// 								) : (
// 									<>
// 										<strong>Step {i + 1}:</strong>
// 										<p className="mt-1 whitespace-pre-wrap">
// 											{step}
// 										</p>
// 									</>
// 								)}
// 							</div>
// 							{isEditMode && editingIndex !== i && (
// 								<div className="ml-4 flex-shrink-0 space-x-2">
// 									<button
// 										onClick={() => startEdit(i)}
// 										className="text-blue-600"
// 									>
// 										Edit
// 									</button>
// 									<button
// 										onClick={() => deleteStep(i)}
// 										className="text-red-600"
// 									>
// 										Delete
// 									</button>
// 								</div>
// 							)}
// 						</div>
// 					))}
// 					{isEditMode && (
// 						<div className="mt-4 flex space-x-2">
// 							<input
// 								className="flex-1 border rounded px-2 py-1"
// 								placeholder="New step text..."
// 								value={newStep}
// 								onChange={(e) => setNewStep(e.target.value)}
// 							/>
// 							<button
// 								onClick={addStep}
// 								className="bg-green-500 text-white px-4 py-2 rounded-4xl"
// 							>
// 								Add Step
// 							</button>
// 						</div>
// 					)}
// 				</div>
// 			</div>
// 			<div className="ml-auto p-2 pl-6">
// 				<button
// 					className={`bg-gray-300 text-gray-800 px-4 py-2 rounded-4xl mr-2 cursor-pointer transition-colors ${
// 						isEditMode ? "hover:bg-red-500" : " hover:bg-green-500"
// 					} hover:bg-green-500`}
// 					onClick={() => setIsEditMode(!isEditMode)}
// 				>
// 					{isEditMode ? "Cancel" : "Edit"}
// 				</button>
// 				<button
// 					onClick={saveEdits}
// 					disabled={!isEditMode || !hasChanges}
// 					className={`bg-blue-500 text-white px-4 py-2 rounded-4xl transition-colors 
// 						${
// 							!isEditMode || !hasChanges
// 								? "opacity-50 cursor-not-allowed"
// 								: "hover:bg-blue-600"
// 						}`}
// 				>
// 					Save
// 				</button>
// 			</div>
// 		</div>
// 	);
// }
export default function WorkspacePanel() {
	const contextToUse = ChatContext;
	const ctx = useContext(contextToUse);

	const [editableSeq, setEditableSeq] = useState<string[]>([]);
	const [newStep, setNewStep] = useState("");
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editingValue, setEditingValue] = useState("");
	const [isEditMode, setIsEditMode] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		if (ctx?.state.sequence) {
			setEditableSeq(ctx.state.sequence);
		} else if (ctx) {
			// If context exists but sequence might be null/undefined initially
			setEditableSeq([]);
		}
	}, [ctx, ctx?.state.sequence]);

	useEffect(() => {
		if (ctx?.state.sequence) {
			setHasChanges(
				JSON.stringify(editableSeq) !==
					JSON.stringify(ctx.state.sequence)
			);
		} else {
			setHasChanges(editableSeq.length > 0);
		}
	}, [editableSeq, ctx?.state.sequence]);

	if (!ctx) {
		console.error(
			"WorkspacePanel: Context is null. Ensure it's wrapped in a Provider."
		);
		// Context unavailable state
		return (
			<div className="w-full md:w-[35%] lg:w-[30%] xl:w-[25%] flex flex-col h-full bg-slate-50 border-l border-slate-200">
				<div className="p-4 border-b border-slate-200">
					<h2 className="font-semibold text-xl text-slate-800 tracking-tight">
						Workspace
					</h2>
				</div>
				<div className="flex-1 flex items-center justify-center p-6 text-center">
					<div>
						<AlertTriangle
							size={48}
							className="mx-auto text-amber-500 mb-3"
						/>
						<p className="text-slate-600 font-medium">
							Workspace Context Not Available
						</p>
						<p className="text-xs text-slate-500 mt-1">
							Please ensure this component is within a valid
							ChatProvider.
						</p>
					</div>
				</div>
			</div>
		);
	}
	// Destructure sequence from context state AFTER checking ctx is not null
	const {
		state: { sequence },
		updateSequence,
	} = ctx;

	const toggleAndSaveChanges = () => {
		if (isEditMode && hasChanges) {
			updateSequence(editableSeq);
			setHasChanges(false);
		} else if (isEditMode && !hasChanges) {
			setEditableSeq(sequence || []); // Revert to original sequence from context, or empty array if null
		}
		setIsEditMode(!isEditMode);
	};

	const discardChangesAndExitEditMode = () => {
		setEditableSeq(sequence || []); // Revert to original sequence from context
		setHasChanges(false);
		setIsEditMode(false);
		setEditingIndex(null);
	};

	const startEdit = (index: number) => {
		setEditingIndex(index);
		setEditingValue(editableSeq[index]);
	};

	const saveStepEdit = (index: number) => {
		if (editingValue.trim() === "") return;
		const updatedSeq = [...editableSeq];
		updatedSeq[index] = editingValue.trim();
		setEditableSeq(updatedSeq);
		setEditingIndex(null);
	};

	const cancelStepEdit = () => {
		setEditingIndex(null);
		setEditingValue("");
	};

	const deleteStep = (index: number) => {
		const updatedSeq = editableSeq.filter((_, idx) => idx !== index);
		setEditableSeq(updatedSeq);
	};

	const addStep = () => {
		if (newStep.trim() === "") return;
		setEditableSeq([...editableSeq, newStep.trim()]);
		setNewStep("");
	};

	// Empty state: Rendered if not in edit mode AND sequence is empty or null
	if (!isEditMode && (!sequence || sequence.length === 0)) {
		return (
			<div className="w-full md:w-[35%] lg:w-[30%] xl:w-[25%] flex flex-col h-full bg-slate-50 border-l border-slate-200 font-sans">
				{/* Header for empty state */}
				<div className="p-4 border-b border-slate-200 flex justify-between items-center">
					<h2 className="font-semibold text-xl text-slate-800 tracking-tight">
						Workspace
					</h2>
					{/* "Add Steps" button removed from here */}
				</div>
				{/* Body of empty state */}
				<div className="flex-1 flex items-center justify-center p-6 text-center">
					<div>
						<ListChecks
							size={48}
							className="mx-auto text-slate-400 mb-3"
						/>
						<p className="text-slate-600 font-medium">
							No Sequence Available
						</p>
						<p className="text-xs text-slate-500 mt-1">
							Click "Edit Sequence" below to add steps.
						</p>
					</div>
				</div>
				{/* Footer for empty state - this shows the "Edit Sequence" button */}
				<div className="p-3 border-t border-slate-200 bg-slate-100/50 flex items-center justify-end space-x-2">
					<button
						onClick={() => setIsEditMode(true)}
						className="px-4 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white rounded-md shadow-sm transition-colors flex items-center gap-1.5"
					>
						<Edit3 size={16} /> Edit Sequence
					</button>
				</div>
			</div>
		);
	}

	// Main panel rendering (if not in the empty state described above, or if in edit mode)
	return (
		<div className="w-full md:w-[35%] lg:w-[30%] xl:w-[25%] flex flex-col h-full bg-slate-50 border-l border-slate-200 font-sans">
			{/* Header */}
			<div className="p-4 border-b border-slate-200 flex justify-between items-center">
				<h2 className="font-semibold text-xl text-slate-800 tracking-tight">
					Workspace
				</h2>
			</div>

			{/* Sequence Steps Area */}
			<div className="flex-1 overflow-y-auto p-4 space-y-3">
				{editableSeq.map((step, i) => (
					<div
						key={i}
						className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm transition-all hover:shadow-md"
					>
						{editingIndex === i ? (
							// Editing state for a step
							<div className="space-y-2">
								<textarea
									value={editingValue}
									onChange={(e) =>
										setEditingValue(e.target.value)
									}
									className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm resize-none"
									rows={3}
									aria-label={`Edit step ${i + 1}`}
								/>
								<div className="flex items-center justify-end space-x-2">
									<button
										onClick={cancelStepEdit}
										className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1"
									>
										<XCircle size={14} /> Cancel
									</button>
									<button
										onClick={() => saveStepEdit(i)}
										className="px-3 py-1.5 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center gap-1"
									>
										<CheckCircle size={14} /> Save Step
									</button>
								</div>
							</div>
						) : (
							// View state for a step
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<p className="text-xs text-slate-500 font-medium mb-0.5">
										STEP {i + 1}
									</p>
									<p className="text-sm text-slate-700 whitespace-pre-wrap">
										{step}
									</p>
								</div>
								{isEditMode && (
									<div className="ml-3 flex-shrink-0 flex flex-col items-end space-y-1.5">
										<button
											onClick={() => startEdit(i)}
											className="p-1.5 text-sky-600 hover:text-sky-700 hover:bg-sky-100 rounded-md transition-colors"
											aria-label={`Edit step ${i + 1}`}
										>
											<Edit3 size={16} />
										</button>
										<button
											onClick={() => deleteStep(i)}
											className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
											aria-label={`Delete step ${i + 1}`}
										>
											<Trash2 size={16} />
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				))}

				{/* Add New Step Area (only in edit mode) */}
				{isEditMode && (
					<div className="mt-4 pt-4 border-t border-dashed border-slate-300">
						{/* Prompt to add steps if sequence is empty and in edit mode */}
						{editableSeq.length === 0 && (
							<div className="text-center p-2 mb-3 text-sm text-slate-500 bg-slate-100 rounded-md">
								<p>The sequence is currently empty.</p>
								<p>Use the form below to add the first step.</p>
							</div>
						)}
						<p className="text-sm font-medium text-slate-600 mb-1.5">
							Add New Step
						</p>
						<div className="flex items-start space-x-2">
							<textarea
								className="flex-1 p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm resize-none bg-white"
								placeholder="Describe the new step..."
								value={newStep}
								onChange={(e) => setNewStep(e.target.value)}
								rows={2}
								aria-label="New step text"
							/>
							<button
								onClick={addStep}
								disabled={!newStep.trim()}
								className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md shadow-sm transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<PlusCircle size={16} /> Add
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Footer with Action Buttons */}
			<div className="p-3 border-t border-slate-200 bg-slate-100/50 flex items-center justify-end space-x-2">
				{isEditMode ? (
					<>
						<button
							onClick={discardChangesAndExitEditMode}
							className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md shadow-sm transition-colors flex items-center gap-1.5"
						>
							<XCircle size={16} /> Cancel
						</button>
						<button
							onClick={toggleAndSaveChanges}
							disabled={!hasChanges}
							className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Save size={16} /> Save Changes
						</button>
					</>
				) : (
					<button
						onClick={() => setIsEditMode(true)}
						className="px-4 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white rounded-md shadow-sm transition-colors flex items-center gap-1.5"
					>
						<Edit3 size={16} /> Edit Sequence
					</button>
				)}
			</div>
		</div>
	);
}