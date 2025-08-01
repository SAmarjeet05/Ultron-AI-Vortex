export interface NavigationCard {
  id: string;
  icon: string;
  label: string;
  color: string;
  description: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  category: string;
  categoryIcon: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  createdAt: Date;
}

export interface ChatsByCategory {
  [categorySlug: string]: Conversation[];
}

export interface CategoryDetailProps {
  category: NavigationCard;
  onBack: () => void;
  chatsByCategory?: ChatsByCategory;
  onCreateNewChat?: (categorySlug: string) => void;
  onSelectChat?: (chat: Conversation) => void;
  activeChatId?: string;
  onRenameChat?: (chatId: string, newTitle: string) => void;
}

export type Theme = 'light' | 'dark';