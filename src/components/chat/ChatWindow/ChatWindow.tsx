"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { UIMessage } from "ai";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage from "@/components/chat/ChatMessage";
import styles from "./ChatWindow.module.scss";

interface ChatWindowProps {
  messages: UIMessage[];
  input: string;
  isLoading: boolean;
  isHydrated: boolean;
  error: Error | undefined;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  onSuggestedQuestion: (question: string) => void;
}

const SUGGESTED = [
  "What trends do you see in my results?",
  "Which biomarkers are outside normal range?",
  "What should I discuss with my doctor?",
  "How has my hemoglobin changed over time?",
];

export default function ChatWindow({
  messages,
  input,
  isLoading,
  isHydrated,
  error,
  handleInputChange,
  handleSubmit,
  onSuggestedQuestion,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages[messages.length - 1];
  const showTyping = isLoading && lastMessage?.role === "user";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <section className={styles.window}>
      <div className={styles.messages}>
        {error ? <div className={styles.error}>Something went wrong. Please try again.</div> : null}

        {!isHydrated ? (
          <div className={styles.hydrationState}>Restoring previous conversation...</div>
        ) : null}

        {isHydrated && messages.length === 0 ? (
          <div className={styles.suggestions}>
            {SUGGESTED.map((question) => (
              <button
                key={question}
                type="button"
                className={styles.suggestion}
                onClick={() => onSuggestedQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        ) : null}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {showTyping ? (
          <div className={styles.typingBubble}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <div className={styles.bottom}>
        <ChatInput
          input={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}
