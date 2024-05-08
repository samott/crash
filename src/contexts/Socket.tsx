"use client"

import { createContext } from "react";
import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
	withCredentials: true
});

export const SocketContext = createContext(socket);
