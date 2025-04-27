/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import useSocket from "../hooks/useSocket";

axios.defaults.withCredentials = true;

export interface User {
	id: number;
	email: string;
	onboarded: boolean;
	name?: string;
	company_name?: string;
	role?: string;
	industry?: string;
	roles_hire?: string;
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string) => Promise<void>;
	completeOnboarding: (payload: Partial<User>) => Promise<void>;
	logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const socket = useSocket();

	useEffect(() => {
		axios.get("/api/auth/me").then((res) => setUser(res.data.user));
	}, []);

	const login = async (email: string, password: string) => {
		const res = await axios.post("/api/auth/login", { email, password });
		setUser(res.data.user);

		if (socket) {
			socket.emit("authenticate", { user_id: res.data.user.id });
		}
	};

	const register = async (email: string, password: string) => {
		const res = await axios.post("/api/auth/register", { email, password });
		setUser(res.data.user);

		if (socket) {
			socket.emit("authenticate", { user_id: res.data.user.id });
		}
	};

	const completeOnboarding = async (data: unknown) => {
		const res = await axios.post("/api/auth/complete_onboarding", data);
		setUser(res.data.user);
	};

	const logout = () => {
		axios.post("/api/auth/logout");
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{ user, login, register, completeOnboarding, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}
