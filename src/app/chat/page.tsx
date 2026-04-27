"use client";

import { ChatWindow } from "@/components/chat";
import { Button } from "@/components/ui";
import { useChat } from "@/hooks/useChat";
import styles from "./page.module.scss";

export default function ChatPage() {
  const {
    messages,
    input,
    isLoading,
    isHydrated,
    error,
    handleInputChange,
    handleSubmit,
    clearChat,
    sendMessageWithContext,
  } = useChat();

  const handleSuggestedQuestion = (question: string) => {
    if (!isHydrated || isLoading) return;
    void sendMessageWithContext(question);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>AI Chat</h1>
          <p className={styles.subtitle}>Ask questions about your blood test results</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void clearChat();
          }}
          disabled={messages.length === 0 || isLoading}
        >
          Clear chat
        </Button>
      </div>

      <div className={styles.chatContainer}>
        <ChatWindow
          messages={messages}
          input={input}
          isLoading={isLoading}
          isHydrated={isHydrated}
          error={error}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onSuggestedQuestion={handleSuggestedQuestion}
        />
      </div>
    </div>
  );
}