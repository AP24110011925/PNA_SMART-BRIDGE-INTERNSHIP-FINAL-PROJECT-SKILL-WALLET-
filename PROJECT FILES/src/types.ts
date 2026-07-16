// src/types.ts

export interface StarterOption {
  type: "Icebreaker" | "Topic-Specific" | "Goal-Oriented";
  text: string;
  explanation: string;
}

export interface ConversationStarter {
  id: string;
  eventDescription: string;
  interests: string;
  goals: string;
  extractedThemes: string[];
  starters: StarterOption[];
  timestamp: string;
  rating: "useful" | "not_useful" | null;
}

export interface FeedbackLog {
  id: string;
  starterId: string;
  rating: "useful" | "not_useful";
  feedbackText: string;
  timestamp: string;
}

export interface WikipediaResult {
  found: boolean;
  title?: string;
  summary?: string;
  url?: string;
  thumbnail?: string | null;
  message?: string;
}
