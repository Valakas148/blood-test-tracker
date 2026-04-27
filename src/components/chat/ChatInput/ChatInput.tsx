"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { Button, Spinner } from "@/components/ui";
import styles from "./ChatInput.module.scss";

interface ChatInputProps {
  input: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}

export default function ChatInput({ input, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const maxHeight = 180;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your blood test results..."
        rows={1}
        disabled={isLoading}
        className={styles.textarea}
      />
      <Button
        type="submit"
        variant="primary"
        className={styles.sendButton}
        disabled={isLoading || input.trim().length === 0}
        aria-label="Send message"
      >
        {isLoading ? <Spinner size="sm" tone="inherit" /> : <SendHorizontal size={18} />}
      </Button>
    </form>
  );
}
