import React, { useState } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { RecentConversations } from './components/RecentConversations';
import { CategoryDetailView } from './components/CategoryDetailView';
import { SettingsView } from './components/SettingsView';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import type { NavigationCard, Conversation, ChatsByCategory } from './types';

// Mock data for recent conversations
const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Help with React TypeScript',
    lastMessage: 'How do I properly type props in React components?',
    timestamp: '2 hours ago',
    category: 'code',
    categoryIcon: 'Code',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Creative Writing Session',
    lastMessage: 'Write a short story about time travel...',
    timestamp: '1 day ago',
    category: 'writing',
    categoryIcon: 'PenTool',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'AI Ethics Discussion',
    lastMessage: 'What are the implications of AI in healthcare?',
    timestamp: '2 days ago',
    category: 'knowledge',
    categoryIcon: 'HelpCircle',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    title: 'Image Generation Request',
    lastMessage: 'Create a logo for my startup...',
    timestamp: '3 days ago',
    category: 'image',
    categoryIcon: 'Image',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: 'Document Analysis',
    lastMessage: 'Analyze this research paper for key insights...',
    timestamp: '1 week ago',
    category: 'document',
    categoryIcon: 'FileText',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '6',
    title: 'General Chat Session',
    lastMessage: 'Tell me about the latest developments in AI...',
    timestamp: '1 week ago',
    category: 'chat',
    categoryIcon: 'Brain',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
];

// Create chatsByCategory from mock conversations
const createChatsByCategory = (conversations: Conversation[]): ChatsByCategory => {
  return conversations.reduce((acc, conv) => {
    if (!acc[conv.category]) {
      acc[conv.category] = [];
    }
    acc[conv.category].push(conv);
    return acc;
  }, {} as ChatsByCategory);
};

function App() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'category'>('home');
  const [selectedCategory, setSelectedCategory] = useState<NavigationCard | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const { theme, toggleTheme } = useTheme();

  const chatsByCategory = createChatsByCategory(conversations);

  const handleCardClick = (card: NavigationCard) => {
    setSelectedCategory(card);
    setCurrentView('category');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCategory(null);
  };

  const handleOpenConversation = (conversation: Conversation) => {
    // Find the category card for this conversation
    const categoryCard = {
      id: conversation.category,
      icon: conversation.categoryIcon,
      label: conversation.category.charAt(0).toUpperCase() + conversation.category.slice(1),
      color: getCategoryColor(conversation.category),
      description: `Continue your ${conversation.category} conversation`
    };
    
    setSelectedCategory(categoryCard);
    setCurrentView('category');
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
  };

  const handleExportConversation = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      // Mock export functionality
      console.log('Exporting conversation:', conversation);
      alert(`Exporting "${conversation.title}" - this would download the conversation as a file.`);
    }
  };

  const handleCreateNewChat = (categorySlug: string) => {
    const newChat: Conversation = {
      id: Date.now().toString(),
      title: '',
      lastMessage: 'Chat started...',
      timestamp: 'Just now',
      category: categorySlug,
      categoryIcon: getCategoryIcon(categorySlug),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setConversations(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const handleSelectChat = (chat: Conversation) => {
    setActiveChatId(chat.id);
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === chatId 
          ? { ...conv, title: newTitle, updatedAt: new Date() }
          : conv
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      {/* Main Content */}
      {currentView === 'home' ? (
        <div className="min-h-screen">
          <TopNavigation onCardClick={handleCardClick} />
          <RecentConversations
            conversations={conversations}
            onOpen={handleOpenConversation}
            onDelete={handleDeleteConversation}
            onExport={handleExportConversation}
          />
        </div>
      ) : (
        selectedCategory && (
          selectedCategory.id === 'settings' ? (
            <SettingsView
              category={selectedCategory}
              onBack={handleBackToHome}
            />
          ) : (
            <CategoryDetailView
              category={selectedCategory}
              onBack={handleBackToHome}
              chatsByCategory={chatsByCategory}
              onCreateNewChat={handleCreateNewChat}
              onSelectChat={handleSelectChat}
              activeChatId={activeChatId}
              onRenameChat={handleRenameChat}
            />
          )
        )
      )}
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'chat': '#3B82F6',
    'code': '#14B8A6',
    'image': '#8B5CF6',
    'document': '#F97316',
    'writing': '#EF4444',
    'knowledge': '#10B981',
    'voice': '#F59E0B',
    'settings': '#6B7280'
  };
  return colors[category] || '#6B7280';
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'chat': 'Brain',
    'code': 'Code',
    'image': 'Image',
    'document': 'FileText',
    'writing': 'PenTool',
    'knowledge': 'HelpCircle',
    'voice': 'Mic',
    'settings': 'Settings'
  };
  return icons[category] || 'Brain';
}

export default App;