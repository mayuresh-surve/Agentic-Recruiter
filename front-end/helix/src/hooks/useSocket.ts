import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocket(): Socket | null {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const s = io("http://localhost:5001", {withCredentials: true});
		s.on("connect", () => console.log("socket connected"));
		setSocket(s);
		return () => {
			s.disconnect();
		};
	}, []);

	return socket;
}
