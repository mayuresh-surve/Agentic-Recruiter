import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, ChevronDown } from "lucide-react";

// export default function Header() {
// 	const auth = useContext(AuthContext)!;
// 	return (
// 		<div className="w-full h-10 px-4 flex items-center justify-end bg-white border-b">
// 			<span className="mr-4 text-sm text-gray-700">
// 				{auth.user?.name}
// 			</span>
// 			<button
// 				onClick={auth.logout}
// 				className="text-sm text-white p-2 rounded hover:underline bg-red-400"
// 			>
// 				Logout
// 			</button>
// 		</div>
// 	);
// }
export default function Header() {
	// Use actual AuthContext or fall back to MockAuthContext
	const contextToUse = AuthContext;
	const auth = useContext(contextToUse);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	// Handle context unavailability gracefully
	if (!auth || !auth.user) {
		// This case should ideally be handled by the MockAuthProvider's login button
		// or your app's main routing logic if AuthContext is real.
		return (
			<div className="w-full h-16 px-4 md:px-6 flex items-center justify-end bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 ">
				<p className="text-sm text-slate-500">
					User not authenticated.
				</p>
			</div>
		);
	}

	const { user, logout } = auth;
	const userInitials = user.name
		?.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.substring(0, 2);

	return (
		<header className="w-full h-16 px-4 md:px-6 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 font-sans">
			{/* Logo or App Name - Placeholder */}
			<div>
				<a href="#" className="text-xl font-bold text-sky-600">
					Rune
				</a>
			</div>

			{/* User menu / Logout button */}
			<div className="relative">
				<button
					onClick={() => setDropdownOpen(!dropdownOpen)}
					className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
					aria-haspopup="true"
					aria-expanded={dropdownOpen}
				>
					{user.avatarUrl ? (
						<img
							src={user.avatarUrl}
							alt={user.name}
							className="w-8 h-8 rounded-full object-cover border-2 border-slate-300"
							onError={(e) =>
								(e.currentTarget.src = `https://placehold.co/40x40/A78BFA/FFFFFF?text=${userInitials}`)
							}
						/>
					) : (
						<div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-semibold border-2 border-purple-300">
							{userInitials}
						</div>
					)}
					<span className="hidden md:inline text-sm font-medium text-slate-700">
						{user.name}
					</span>
					<ChevronDown
						size={16}
						className={`text-slate-500 transition-transform duration-200 ${
							dropdownOpen ? "rotate-180" : ""
						}`}
					/>
				</button>

				{/* Dropdown Menu */}
				{dropdownOpen && (
					<div
						className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 border border-slate-200 py-1"
						role="menu"
						aria-orientation="vertical"
						aria-labelledby="user-menu-button"
					>
						<div className="px-3 py-2 border-b border-slate-100">
							<p className="text-sm font-semibold text-slate-700 truncate">
								{user.name}
							</p>
							{user.email && (
								<p className="text-xs text-slate-500 truncate">
									{user.email}
								</p>
							)}
						</div>
						{/* Add other menu items here if needed, e.g., Profile, Settings */}
						{/* <a href="#" className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800" role="menuitem">Profile</a> */}
						<button
							onClick={() => {
								logout();
								setDropdownOpen(false);
							}}
							className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
							role="menuitem"
						>
							<LogOut size={16} />
							Logout
						</button>
					</div>
				)}
			</div>
		</header>
	);
}
