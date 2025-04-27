import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import LoginPage from "./components/LoginPage";
import OnboardingForm from "./components/OnboardingForm";
import ConversationListPanel from "./components/ConversationListPanel";
import ChatPanel from "./components/ChatPanel";
import WorkspacePanel from "./components/WorkspacePanel";
import Header from "./components/Header";

function MainApp() {
	const auth = useContext(AuthContext)!;
	if (!auth.user) {
		return <LoginPage />;
	}
	if (!auth.user.onboarded) {
		return <OnboardingForm />;
	}

	return (
		<ChatProvider>
			<Header />
			<div className="flex h-screen">
				<ConversationListPanel />
				<ChatPanel />
				<WorkspacePanel />
			</div>
		</ChatProvider>
	);
}

export default function App() {
	return (
		<AuthProvider>
			<MainApp />
		</AuthProvider>
	);
}
