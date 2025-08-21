

export interface NavigationCard {
  id: string;        // UUID
  slug: string;      // e.g. "chat", "code"
  icon: string;
  label: string;
  color: string;
  description: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  chat_name?: string; 
  category: string;
  timestamp: string;
  categoryIcon: string;
  createdAt: Date;
  created_at?: string;
  updatedAt: Date;
  messages?: Message[];
}

export interface Category {
  id: string;        // UUID
  slug: string;      // e.g. "chat", "code"
  label: string;
  icon: string;
  color: string;
  description: string;
}


export interface FilePreview {
  id: string;
  file?: File;
  url?: string;
  type: "file" | "link" | "image" | "document";
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  createdAt: Date;
  attachments?: FilePreview[];
  temp?: boolean;
  chat_id?: string; // ✅ added as optional
}



export interface ChatsByCategory {
  [categorySlug: string]: Conversation[];
}

export interface CategoryDetailProps {
  category: NavigationCard;
  onBack: () => void;
  chatsByCategory: ChatsByCategory;
  onCreateNewChat?: (categorySlug: string) => Promise<any> | void;
  onSelectChat?: (chat: Conversation) => Promise<void> | void;  // or just (chat: Conversation) => void if you want
  activeChatId?: string;
  onDeleteChat? : (chatId: string, categorySlug: string) => Promise<void> | void;
  onRenameChat?: (chatId: string, newTitle: string, categorySlug: string) => Promise<void> | void;

  messages?: Message[];
  onSendMessage?: (text: string, attachments?: FilePreview[]) => Promise<void>;
  onEditMessage: (messageId: string, newText: string) => Promise<void>;
}

export interface SettingsViewProps {
  category: NavigationCard;
  onBack: () => void;
}


export interface BackendMessage {
  id: string;
  content: string;
  role: string;       // 'user' or 'assistant'
  timestamp: string;  // ISO date string
}



export type Theme = 'light' | 'dark';