type ChatMessage = {
  platform: 'twitch';
  username: string;
  message: string;
  timestamp: string;
  color: string;
  badges: Record<string, string>;
};

export type { ChatMessage };
