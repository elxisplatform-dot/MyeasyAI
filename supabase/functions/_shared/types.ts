export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  userId: string;
  includeInternet?: boolean;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface Source {
  title: string;
  url?: string;
  snippet: string;
  type: "document" | "web";
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "free" | "pro" | "enterprise" | "admin";
  subscription_id?: string;
  memory: Record<string, unknown>;
}
