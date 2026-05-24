export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  content: string;
  lang: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  live: boolean;
  apiModel?: string;
  keyLabel?: string;
  keyPlaceholder?: string;
  keyHelpUrl?: string;
}

export type ApiKeyMap = Record<string, string>;

export interface PromptTemplate {
  icon: string;
  title: string;
  tag: string;
  desc: string;
  body: string;
}

export type View = 'chat' | 'prompts' | 'about';
