import React, { useState, useEffect } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { RecentConversations } from './components/RecentConversations';
import { CategoryDetailView } from './components/CategoryDetailView';
import { SettingsView } from './components/SettingsView';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import type { NavigationCard, Conversation, ChatsByCategory, Message } from './types';

const categoryToModelMap: Record<string, string> = {
  chat: 'llama3-chat',
  code: 'deepseek-coder',
  image: 'llava',
  document: 'llama3-document',
  writing: 'llama3-writing',
  knowledge: 'llama3-knowledge',
  voice: 'llama3-voice',
};

function App() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'category'>('home');
  const [selectedCategory, setSelectedCategory] = useState<NavigationCard | null>(null);
  const { theme, toggleTheme } = useTheme();
  const [chatsByCategory, setChatsByCategory] = useState<ChatsByCategory>({});
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); // ADDED messages state

  // Fetch chats for category
  const fetchChatsForCategory = async (categorySlug: string) => {
    try {
      const response = await fetch(`http://localhost:8000/chats/${categorySlug}`);
      const data = await response.json();

      const sortedChats = (data?.chats || []).sort(
        (a: Conversation, b: Conversation) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setChatsByCategory((prev) => ({
        ...prev,
        [categorySlug]: sortedChats,
      }));
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  };

  // Fetch messages for active chat
  async function fetchMessages(chatId: string) {
    try {
      const res = await fetch(`http://localhost:8000/chats/${chatId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data); // assuming data is array of messages
    } catch (error) {
      console.error(error);
    }
  }

  // Create new chat
  // Create new chat (updated to return the created chat)
  // inside App.tsx - replace existing handleCreateNewChat with this

  // Create new chat
  async function handleCreateNewChat(categorySlug: string): Promise<string | null> {
    const response = await fetch('http://localhost:8000/chats/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_name: "New Chat",
        slug: categorySlug
      }),
    });

    if (!response.ok) {
      console.error("Failed to create chat");
      return null;
    }
    

    const data = await response.json();
    return data.id;  // Return the new chat's ID!
  }


  // Send message function with streaming response
  // Send message function with streaming response (use latest history)
  const sendMessage = async (content: string) => {
    if (!activeChatId || !selectedCategory) {
      console.warn("No active chat or category selected");
      return;
    }

    const model = categoryToModelMap[selectedCategory.id] || "mistral:latest";

    const userMsg: Message = {
      id: `temp-user-${Date.now()}`,
      chat_id: activeChatId,
      sender: "user",
      text: content,
      createdAt: new Date(),
    };

    // Add the user message locally first (optimistic UI)
    setMessages((prev) => {
      // we return the new state here and capture it in `history` below
      return [...prev, userMsg];
    });

    // build history *immediately* from existing messages plus the new one
    // (use the latest snapshot by reading current state is tricky — we simply
    //  combine `messages` (state variable) with userMsg; this is usually fine
    //  because this handler runs in response to user action and messages is up-to-date).
    // If you want absolute correctness, you can maintain a ref for messages.
    const historyForRequest = [...messages, userMsg].map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    const assistantMsgId = `temp-ai-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      chat_id: activeChatId,
      sender: "ai",
      text: "",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await fetch(`http://localhost:8000/chat/${model}/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: historyForRequest,
          chat_id: activeChatId,
        }),
      });

      if (!response.body) throw new Error("No response body in streaming");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, text: (msg.text ?? "") + chunk } : msg
            )
          );
        }
      }

      // optionally: after streaming completes, you might re-fetch the messages
      // for this chat from your backend to get canonical IDs / timestamps:
      // await fetchMessages(activeChatId);
    } catch (err) {
      console.error("Streaming message error:", err);
      // Optionally add an error message in chat
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          chat_id: activeChatId ?? "",
          sender: "ai",
          text: "❌ Failed to get response from server.",
          createdAt: new Date(),
        } as Message,
      ]);
    }
  };


  // Select chat handler (load messages)
  const handleSelectChat = async (chat: Conversation) => {
    setActiveChatId(chat.id);

    try {
      const res = await fetch(`http://localhost:8000/chats/${chat.id}/messages`);
      if (!res.ok) throw new Error("Failed to fetch chat messages");

      const messages: Message[] = await res.json();

      // Convert date strings to Date objects
      setMessages(messages.map(m => ({
        ...m,
        createdAt: new Date(m.createdAt),
      })));

      setIsNewChat(false);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };


  // Rename chat
  const handleRenameChat = async (chatId: string, newTitle: string, categorySlug: string) => {
    try {
      const res = await fetch(`http://localhost:8000/chats/${chatId}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_title: newTitle }),
      });

      const data = await res.json();
      console.log("Rename response:", data);

      await fetchChatsForCategory(categorySlug);
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  // Delete chat
  const handleDeleteConversation = async (chatId: string, categorySlug: string) => {
    try {
      await fetch(`http://localhost:8000/chats/${chatId}`, {
        method: 'DELETE',
      });
      fetchChatsForCategory(categorySlug);
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  // Other handlers...

  // Load recent conversations on mount
  useEffect(() => {
  const fetchRecent = async () => {
    try {
      const response = await fetch('http://localhost:8000/recent-chats');
      const data = await response.json();
      console.log(data.chats);


      // Map backend chat object to frontend conversation object
      const mappedConversations = (data?.chats || []).map((chat: any) => ({
        id: chat.id,
        title: chat.chat_name,       // map chat_name to title
        category: chat.category,     // category from backend
        lastMessage: chat.last_message,             // you can add last message if available
      }));

      setRecentConversations(mappedConversations);
    } catch (error) {
      console.error("Failed to fetch recent chats:", error);
    }
  };
  fetchRecent();
}, []);


  // Handle category card click
  const handleCardClick = (card: NavigationCard) => {
    setSelectedCategory(card);
    setCurrentView('category');
    fetchChatsForCategory(card.slug);
  };

  // Handle back to home
  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCategory(null);
    setActiveChatId(null);
    setMessages([]);
  };

  // Handle open conversation from recent list
  const handleOpenConversation = (conversation: Conversation) => {
    const categoryCard = {
      id: conversation.category,
      icon: conversation.categoryIcon,
      label: conversation.category.charAt(0).toUpperCase() + conversation.category.slice(1),
      color: getCategoryColor(conversation.category),
      description: `Continue your ${conversation.category} conversation`,
      slug: conversation.category,
    };
    setSelectedCategory(categoryCard);
    setCurrentView('category');
    setActiveChatId(conversation.id);
    fetchMessages(conversation.id);
  };

  // Helper functions for colors & icons
  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      chat: '#3B82F6',
      code: '#14B8A6',
      image: '#8B5CF6',
      document: '#F97316',
      writing: '#EF4444',
      knowledge: '#10B981',
      voice: '#F59E0B',
      settings: '#6B7280',
    };
    return colors[category] || '#6B7280';
  }

  function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      chat: 'Brain',
      code: 'Code',
      image: 'Image',
      document: 'FileText',
      writing: 'PenTool',
      knowledge: 'HelpCircle',
      voice: 'Mic',
      settings: 'Settings',
    };
    return icons[category] || 'Brain';
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      {currentView === 'home' ? (
        <div className="min-h-screen">
          <TopNavigation onCardClick={handleCardClick} />
          <RecentConversations
            conversations={recentConversations}
            onOpen={handleOpenConversation}
            onDelete={(chatId) => {
              if (!selectedCategory) return;
              handleDeleteConversation(chatId, selectedCategory.id);
            }}
            onExport={(chatId) => {
              // Implement export logic here if needed
              console.log('Export chat', chatId);
            }}
          />
        </div>
      ) : selectedCategory ? (
        selectedCategory.id === 'settings' ? (
          <SettingsView category={selectedCategory} onBack={handleBackToHome} />
        ) : (
          <CategoryDetailView
            category={selectedCategory}
            onBack={handleBackToHome}
            chatsByCategory={chatsByCategory}
            onCreateNewChat={handleCreateNewChat}
            onSelectChat={handleSelectChat}
            activeChatId={activeChatId ?? undefined}
            onDeleteChat={handleDeleteConversation}
            onRenameChat={(chatId, newTitle) => {
              if (!selectedCategory) return;
              handleRenameChat(chatId, newTitle, selectedCategory.id);
            }}
            messages={messages} // Pass messages if needed by CategoryDetailView
            onSendMessage={sendMessage} // Pass sendMessage handler if needed
            onEditMessage={async (id, newText) => {
              console.log("Edit message", id, newText);
              // TODO: Implement real editing
            }}

          />
        )
      ) : null}
    </div>
  );
}

export default App;
