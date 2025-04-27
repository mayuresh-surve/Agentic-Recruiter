// src/components/OnboardingForm.tsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

interface OnboardingFormProps {
	name: string;
	company_name: string;
	role: string;
	industry: string;
	roles_hire: string;
}

export default function OnboardingForm() {
	const auth = useContext(AuthContext)!;
	const [form, setForm] = useState<OnboardingFormProps>({
		name: "",
		company_name: "",
		role: "",
		industry: "",
		roles_hire: "",
	});

	const submit = async () => {
		await auth.completeOnboarding(form);
	};

	return (
		<div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
			<h2 className="text-2xl mb-4">Tell us about yourself</h2>
			<div className="space-y-4">
				<label className="block text-sm font-medium text-gray-700">What is your name?</label>
				<input
					placeholder="Name"
					className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
					onChange={(e) => setForm({ ...form, name: e.target.value })}
				/>
				<label className="block text-sm font-medium text-gray-700">What company do you work for?</label>
				<input
					placeholder="Company"
					className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
					onChange={(e) =>
						setForm({ ...form, company_name: e.target.value })
					}
				/>
				<label className="block text-sm font-medium text-gray-700">What is your role?</label>
				<input
					placeholder="Role"
					className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
					onChange={(e) => setForm({ ...form, role: e.target.value })}
				/>
				<label className="block text-sm font-medium text-gray-700">Which industry are you in?</label>
				<input
					placeholder="Industry"
					className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
					onChange={(e) => setForm({ ...form, industry: e.target.value })}
				/>
				<label className="block text-sm font-medium text-gray-700">What roles do you hire for?</label>
				<textarea
					rows={4}
					placeholder="Roles hire"
					className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none h-24"
					onChange={(e) =>
						setForm({ ...form, roles_hire: e.target.value })
					}
				/>
			</div>
			<button
				onClick={submit}
				className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
			>
				Continue to Chat
			</button>
		</div>
	);
}
