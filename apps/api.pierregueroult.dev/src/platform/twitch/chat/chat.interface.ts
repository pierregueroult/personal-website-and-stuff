export interface TwitchMessage {
  username: string;
  message: string;
  color: string;
}

export interface TwitchTags {
  [key: string]: string;
}

export interface ConnectionConfig {
  channel: string;
  username: string;
  accessToken: string;
}
