import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Header() {
	const auth = useContext(AuthContext)!;
	return (
		<div className="w-full h-10 px-4 flex items-center justify-end bg-white border-b">
			<span className="mr-4 text-sm text-gray-700">
				{auth.user?.name}
			</span>
			<button
				onClick={auth.logout}
				className="text-sm text-white p-2 rounded hover:underline bg-red-400"
			>
				Logout
			</button>
		</div>
	);
}
