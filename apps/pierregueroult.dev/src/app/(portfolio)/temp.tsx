"use client";

import { useChatSocket } from "@/hooks/use-chat-socket";
import { useEffect } from "react";
import { Button } from "@repo/ui/components/button";

export default function ChatTemporaire () {
  const { messages, isConnected, handleConnection } = useChatSocket();

  useEffect(() => {
    console.log("Messages received:", messages);
  }, [messages]);

  return (
    <main>
      <h1>Chat Temporaire</h1>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
     <Button onClick={handleConnection}> 
        {isConnected ? "Disconnect" : "Connect"}
      </Button>
    </main>
  );
}
