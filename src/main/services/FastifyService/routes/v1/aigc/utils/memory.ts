import { randomUUID } from '@shared/modules/crypto';
import { isArray, isArrayEmpty } from '@shared/modules/validate';
import { estimateTokenCount } from 'tokenx';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
}

export interface RecentMessageOptions {
  recentCount?: number; // Number of messages to return
  maxTokens?: number; // Maximum total token count
}

class MemoryManager {
  private static instance: MemoryManager;
  private messages: Map<string, ChatMessage[]> = new Map();

  private constructor() {}

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Create a new chat session with optional initial messages
   */
  createSession(initialMessages: ChatMessage[] = []): ChatSession {
    const sessionId = randomUUID();
    this.messages.set(sessionId, [...initialMessages]);
    return { id: sessionId, messages: this.messages.get(sessionId)! };
  }

  /**
   * Delete a session by ID
   * @param sessionId The session ID
   */
  delSession(sessionId: string[]): void {
    sessionId.forEach((id) => this.messages.delete(id));
  }

  /**
   * Add one or multiple messages to a session
   * @param sessionId The session ID
   * @param messages Single message or array of messages
   */
  addMessage(sessionId: string, messages: ChatMessage | ChatMessage[]): ChatSession {
    const history = this.messages.get(sessionId) || [];
    const newHistory = history.concat(isArray(messages) ? messages : [messages]);
    this.messages.set(sessionId, newHistory);
    return { id: sessionId, messages: newHistory };
  }

  /**
   * Get messages by recentCount or token limit
   * @param sessionId The session ID
   * @param options Either { recentCount } or { maxTokens }
   */
  getMessage(sessionId: string, options: RecentMessageOptions = {}): ChatSession {
    const history = this.messages.get(sessionId) || [];

    // Token-based retrieval
    if (options.maxTokens) {
      const result: ChatMessage[] = [];
      let tokens = 0;

      // Iterate from the end (most recent) backwards
      for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i];
        const msgTokens = estimateTokenCount(msg.content);

        if (tokens + msgTokens > options.maxTokens) break;
        result.unshift(msg);
        tokens += msgTokens;
      }

      return { id: sessionId, messages: result };
    }

    // Count-based retrieval
    if (options.recentCount) {
      const recent = history.slice(-options.recentCount);
      return { id: sessionId, messages: recent };
    }

    return { id: sessionId, messages: history };
  }

  /**
   * Get all sessions
   * @returns All sessions
   */
  getSession(): ChatSession[] {
    const sessions: ChatSession[] = [];
    this.messages.forEach((history, sessionId) => {
      sessions.push({ id: sessionId, messages: history });
    });
    return sessions;
  }

  /**
   * Get all session IDs
   * @returns All session IDs
   */
  getSessionIds(): string[] {
    return Array.from(this.messages.keys());
  }

  /**
   * Delete messages in a session
   * @param sessionId The session ID
   * @param indexes Array of message indexes to delete (supports negative indexes). If omitted, delete all messages
   */
  deleteMessage(sessionId: string, indexes?: number[]): ChatSession {
    let history = this.messages.get(sessionId) || [];

    if (!isArray(indexes) || isArrayEmpty(indexes)) {
      history = [];
    } else {
      const len = history.length;
      const normalizedIndexes = indexes.map((i) => (i < 0 ? len + i : i));
      history = history.filter((_, idx) => !normalizedIndexes.includes(idx));
    }

    this.messages.set(sessionId, history);
    return { id: sessionId, messages: history };
  }

  /**
   * Replace specific messages in a session
   * @param sessionId The session ID
   * @param updates Array of updates [{ index, message }], supports negative indexes
   */
  replaceMessage(sessionId: string, updates: Array<{ index: number; message: ChatMessage }>): ChatSession {
    const history = this.messages.get(sessionId) || [];
    const len = history.length;

    for (const { index, message } of updates) {
      const i = index < 0 ? len + index : index;
      if (i >= 0 && i < len) {
        history[i] = message;
      }
    }

    this.messages.set(sessionId, history);
    return { id: sessionId, messages: history };
  }

  /** Clear all sessions */
  clearSession(): void {
    this.messages.clear();
  }
}

export const memoryManager = MemoryManager.getInstance();
