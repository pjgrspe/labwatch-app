// labwatch-app/types/assistant.ts
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean; // Optional: for showing loading indicator for assistant messages
}