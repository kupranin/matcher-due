/**
 * Simple chat storage for mutual matches (MVP — replace with real-time API later).
 */

export type ChatMessage = {
  id: string;
  matchId: string;
  sender: "candidate" | "employer";
  text: string;
  createdAt: number;
};

const KEY_PREFIX = "matcher_chat_";

export function getChatMessages(matchId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(KEY_PREFIX + matchId);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function addChatMessage(
  matchId: string,
  sender: "candidate" | "employer",
  text: string
): ChatMessage {
  const messages = getChatMessages(matchId);
  const msg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    matchId,
    sender,
    text,
    createdAt: Date.now(),
  };
  messages.push(msg);
  localStorage.setItem(KEY_PREFIX + matchId, JSON.stringify(messages));
  return msg;
}
