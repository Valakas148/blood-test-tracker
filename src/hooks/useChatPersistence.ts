"use client";

import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";
import { db } from "@/lib/db";

interface UseChatPersistenceParams {
  messages: UIMessage[];
  setMessages: (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void;
}

export function useChatPersistence({ messages, setMessages }: UseChatPersistenceParams) {
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const savedMessages = await db.getChatMessages();
        if (isActive && savedMessages.length > 0) {
          setMessages(savedMessages);
        }
      } finally {
        if (isActive) setIsHydrated(true);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [setMessages]);

  useEffect(() => {
    if (!isHydrated) return;

    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      void db.saveChatMessages(messages).catch(() => {
        // Avoid unhandled rejections from transient IndexedDB failures.
      });
    }, 350);

    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isHydrated, messages]);

  const clearPersistedChat = async () => {
    try {
      await db.clearChatMessages();
    } catch {
      // Swallow clear failures to keep chat UX responsive.
    }
  };

  return {
    isHydrated,
    clearPersistedChat,
  };
}
