// src/components/LoginPage.tsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

interface Form {
	email: string;
	password: string;
}

export default function LoginPage() {
	const auth = useContext(AuthContext)!;
	const [mode, setMode] = useState<"login" | "register">("login");
    const [form, setForm] = useState<Form>({email: "", password: ""});

	const submit = async () => {
		if (mode === "login") {
			await auth.login(form.email, form.password);
		} else {
			await auth.register(form.email, form.password);
		}
	};

	return (
		<div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
			<h2 className="text-2xl mb-4">
				{mode === "login" ? "Log In" : "Sign Up"}
			</h2>
			<div className="space-y-4">
			<input
				type="email"
				placeholder="Email"
				className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
				onChange={(e) => setForm({ ...form, email: e.target.value })}
			/>
			<input
				type="password"
				placeholder="Password"
				className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
				onChange={(e) => setForm({ ...form, password: e.target.value })}
			/>
			</div>
			<button
				onClick={submit}
				className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
			>
				{mode === "login" ? "Log In" : "Sign Up"}
			</button>
			<p className="mt-2 text-sm">
				{mode === "login" ? "Need an account?" : "Already have one?"}
				<button
					onClick={() =>
						setMode(mode === "login" ? "register" : "login")
					}
					className="text-blue-500 hover:text-blue-700 ml-1"
				>
					{mode === "login" ? "Sign up" : "Log in"}
				</button>
			</p>
		</div>
	);
}
