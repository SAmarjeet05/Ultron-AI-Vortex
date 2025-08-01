import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Brain, 
  Code, 
  Image, 
  FileText, 
  PenTool, 
  HelpCircle, 
  Mic, 
  Settings,
  MessageSquare
} from 'lucide-react';
import { EnhancedSidebar } from './layout/EnhancedSidebar';
import { ChatInput } from './ui/ChatInput';
import type { CategoryDetailProps, Message, Conversation } from '../types';

const iconMap = {
  Brain,
  Code,
  Image,
  FileText,
  PenTool,
  HelpCircle,
  Mic,
  Settings
};

export function CategoryDetailView({ 
  category, 
  onBack,
  chatsByCategory = {},
  onCreateNewChat,
  onSelectChat,
  activeChatId
}: CategoryDetailProps) {
  const categorySlug = category.id;
  const categoryChats = chatsByCategory[categorySlug] || [];
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isNewChat, setIsNewChat] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  // Markdown renderer (simple, no external deps)
  function renderMarkdown(text: string) {
    // Basic: code block, inline code, bold, italic, emoji
    let html = text
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/:(\w+):/g, '<span>$1</span>'); // emoji placeholder
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // File/image preview mock logic
  function renderAttachment(message: Message) {
    // If message.text contains [file:filename.ext] or [image:url]
    const fileMatch = message.text.match(/\[file:(.+?)\]/);
    const imageMatch = message.text.match(/\[image:(.+?)\]/);
    if (imageMatch) {
      return (
        <div className="mt-2">
          <img src={imageMatch[1]} alt="attachment" className="max-h-40 rounded-lg shadow" />
        </div>
      );
    }
    if (fileMatch) {
      return (
        <div className="mt-2 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">{fileMatch[1]}</span>
        </div>
      );
    }
    return null;
  }

  const handleSendMessage = (text: string) => {
    // If this is the first message in a new chat, clear the new chat state
    if (isNewChat) {
      setIsNewChat(false);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      createdAt: new Date()
    };
    setMessages(prev => [...prev, newMessage]);

    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate AI response
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Great! Let's talk about ${getChatTitle(text)}.`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        createdAt: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1200);
  };

  // Helper to generate chat title from first message
  function getChatTitle(text: string) {
    const words = text.split(' ');
    return words.slice(0, 3).join(' ');
  }

  // Auto-scroll to bottom on new message
  React.useEffect(() => {
    if (chatContainerRef.current && !isNewChat) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, isNewChat]);

  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Brain;

  const handleCreateNewChat = () => {
    if (onCreateNewChat) {
      onCreateNewChat(categorySlug);
    }
    // Reset to new chat state
    setMessages([]);
    setIsNewChat(true);
  };

  const handleSelectChat = (chat: Conversation) => {
    if (onSelectChat) {
      onSelectChat(chat);
    }
    setIsNewChat(false);
    // Load chat messages (mock implementation)
    setMessages(chat.messages || []);
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    console.log('Rename chat:', chatId, 'to:', newTitle);
    // Implementation would update the chat title in your state management
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <EnhancedSidebar
        title={category.label}
        categorySlug={categorySlug}
        chats={categoryChats}
        activeChatId={activeChatId}
        onCreateNewChat={handleCreateNewChat}
        onSelectChat={handleSelectChat}
        onExportChat={(chatId) => console.log('Export chat:', chatId)}
        onSaveChat={(chatId) => console.log('Save chat:', chatId)}
        onDeleteChat={(chatId) => console.log('Delete chat:', chatId)}
        onRenameChat={handleRenameChat}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <IconComponent className="w-6 h-6" style={{ color: category.color }} />
            </div>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {category.label}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area - Conditional Layout */}
        <div ref={chatContainerRef} className={`flex-1 overflow-y-auto ${isNewChat ? 'flex items-center justify-center' : 'p-6 space-y-4'}`}> 
          {isNewChat ? (
            /* New Chat Placeholder */
            <div className="text-center max-w-md mx-auto">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <IconComponent className="w-8 h-8" style={{ color: category.color }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Start a new conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ask me anything about {category.label.toLowerCase()}. I'm here to help!
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <span>Type your message below to get started</span>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {/* AI avatar bubble */}
                  {message.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shadow mr-2">
                      <Brain className="w-5 h-5 text-blue-500" />
                    </div>
                  )}
                  <div
                    className={`
                      max-w-2xl px-4 py-3 rounded-2xl shadow-sm
                      ${message.sender === 'user'
                        ? 'bg-blue-500 text-white ml-auto'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }
                    `}
                    style={{ boxShadow: message.sender === 'user' ? '0 2px 8px #3B82F640' : '0 2px 8px #0001' }}
                  >
                    <div className="mb-1 text-base break-words">
                      {renderMarkdown(message.text)}
                    </div>
                    {renderAttachment(message)}
                    <span className={`block text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shadow mr-2">
                    <Brain className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="max-w-2xl px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 flex items-center shadow-sm">
                    <span className="mr-2">Ultron is typing</span>
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Chat Input - Sticky bottom, centered in chat area */}
        <div className="sticky bottom-0 left-0 w-full flex justify-center px-6 pb-6 bg-transparent z-10">
          <div className="w-full max-w-2xl">
            <ChatInput 
              onSend={handleSendMessage}
              placeholder={`Ask your ${category.label} anything...`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}