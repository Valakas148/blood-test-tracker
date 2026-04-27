"use client";

import type { UIMessage } from "ai";
import styles from "./ChatMessage.module.scss";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: UIMessage;
}

function normalizeMarkdownLists(content: string) {
  return content
    .replace(/^(\s*\d+\.)\s*\r?\n([ \t]+)(\S.*)$/gm, "$1 $3")
    .replace(/^(\s*[-*+])\s*\r?\n([ \t]+)(\S.*)$/gm, "$1 $3");
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const text = normalizeMarkdownLists(
    message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim()
  );

  return (
    <div className={`${styles.row} ${isUser ? styles.userRow : styles.assistantRow}`}>
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
        {isUser ? (
          text
        ) : (
          <div className={styles.markdownContent}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                ul: ({ children, ...props }) => (
                  <ul {...props} className={styles.unorderedList}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol {...props} className={styles.orderedList}>
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li {...props} className={styles.listItem}>
                    {children}
                  </li>
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
