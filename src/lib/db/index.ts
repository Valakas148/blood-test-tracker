import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { UIMessage } from "ai";
import type { Biomarker, BloodTest } from "@/types";

interface BloodTestTrackerDB extends DBSchema {
  uploads: {
    key: string;
    value: BloodTest;
    indexes: { "by-date": string; "by-created-at": number };
  };
  chatState: {
    key: string;
    value: { id: string; messages: UIMessage[]; updatedAt: number };
  };
}

const DB_NAME = "blood-test-tracker";
const DB_VERSION = 2;
const CHAT_STATE_KEY = "current";

let dbPromise: Promise<IDBPDatabase<BloodTestTrackerDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<BloodTestTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains("uploads")) {
          const store = database.createObjectStore("uploads", { keyPath: "id" });
          store.createIndex("by-date", "date");
          store.createIndex("by-created-at", "createdAt");
        }

        if (!database.objectStoreNames.contains("chatState")) {
          database.createObjectStore("chatState", { keyPath: "id" });
        }
      },
    });
  }

  return dbPromise;
}

export const db = {
  async saveUpload(test: BloodTest): Promise<string> {
    try {
      const database = await getDb();
      await database.put("uploads", test);
      return test.id;
    } catch (error) {
      throw new Error(
        `Failed to save upload: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  async getUploads(): Promise<BloodTest[]> {
    try {
      const database = await getDb();
      return database.getAll("uploads");
    } catch (error) {
      throw new Error(
        `Failed to get uploads: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async getUploadById(id: string): Promise<BloodTest | null> {
    try {
      const database = await getDb();
      return (await database.get("uploads", id)) ?? null;
    } catch (error) {
      throw new Error(
        `Failed to get upload by id: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async updateUpload(id: string, test: Partial<BloodTest>): Promise<void> {
    try {
      const database = await getDb();
      const existing = await database.get("uploads", id);
      if (!existing) {
        throw new Error("Upload not found");
      }

      await database.put("uploads", { ...existing, ...test, id });
    } catch (error) {
      throw new Error(
        `Failed to update upload: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async deleteUpload(id: string): Promise<void> {
    try {
      const database = await getDb();
      await database.delete("uploads", id);
    } catch (error) {
      throw new Error(
        `Failed to delete upload: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async getAllBiomarkers(): Promise<Biomarker[]> {
    try {
      const uploads = await this.getUploads();
      return uploads.flatMap((upload) => upload.biomarkers);
    } catch (error) {
      throw new Error(
        `Failed to get biomarkers: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async getChatMessages(): Promise<UIMessage[]> {
    try {
      const database = await getDb();
      const state = await database.get("chatState", CHAT_STATE_KEY);
      return state?.messages ?? [];
    } catch (error) {
      throw new Error(
        `Failed to get chat messages: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async saveChatMessages(messages: UIMessage[]): Promise<void> {
    try {
      const database = await getDb();
      await database.put("chatState", {
        id: CHAT_STATE_KEY,
        messages,
        updatedAt: Date.now(),
      });
    } catch (error) {
      throw new Error(
        `Failed to save chat messages: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async clearChatMessages(): Promise<void> {
    try {
      const database = await getDb();
      await database.delete("chatState", CHAT_STATE_KEY);
    } catch (error) {
      throw new Error(
        `Failed to clear chat messages: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
};
