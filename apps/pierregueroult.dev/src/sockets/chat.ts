"use client";

import io from "socket.io-client";
import { env } from "@/lib/env/client";

const socket = io(env.NEXT_PUBLIC_API_URL, { transports: ["websocket"], autoConnect: false });

export { socket };
