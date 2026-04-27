"use client";

import { useChat as useAIChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useChatPersistence } from "./useChatPersistence";
import { useBloodTests } from "./useBloodTests";

export function useChat() {
  const { data: tests = [] } = useBloodTests();
  const [input, setInput] = useState("");

  const chat = useAIChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const { isHydrated, clearPersistedChat } = useChatPersistence({
    messages: chat.messages,
    setMessages: chat.setMessages,
  });

  const isLoading = chat.status === "submitted" || chat.status === "streaming";

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || !isHydrated) return;
    void chat.sendMessage(
      { text: trimmed },
      {
        body: { bloodTests: tests },
      }
    );
    setInput("");
  };

  const clearChat = async () => {
    chat.setMessages([]);
    setInput("");
    await clearPersistedChat();
  };

  const sendMessageWithContext = (text: string) => {
    return chat.sendMessage(
      { text },
      {
        body: { bloodTests: tests },
      }
    );
  };

  return {
    ...chat,
    input,
    setInput,
    isLoading,
    isHydrated,
    handleInputChange,
    handleSubmit,
    clearChat,
    sendMessageWithContext,
  };
}
