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
  MessageSquare,
  Search,
  FileSearch,
  Lightbulb,
  Database
} from 'lucide-react';
import { EnhancedSidebar } from './layout/EnhancedSidebar';
import { ChatInput } from './ui/ChatInput';
import { MessageRenderer } from './ui/MessageRenderer';
import { TypingIndicator } from './ui/TypingIndicator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { RAGExplorer } from './advanced/RAGExplorer';
import { PromptLab } from './advanced/PromptLab';
import { MemoryModule } from './advanced/MemoryModule';
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
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const handleSendMessage = (text: string) => {
    // If this is the first message in a new chat, clear the new chat state
    if (isNewChat) {
      setIsNewChat(false);
      // Generate a temporary title from the first message
      const title = generateChatTitle(text);
      if (onRenameChat && activeChatId) {
        onRenameChat(activeChatId, title);
      }
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
        text: generateAIResponse(text, category.id),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        createdAt: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  // Generate chat title from first message
  function generateChatTitle(text: string) {
    const words = text.split(' ');
    const title = words.slice(0, 4).join(' ');
    return title.length > 30 ? title.substring(0, 30) + '...' : title;
  }

  // Generate contextual AI response based on category
  function generateAIResponse(userMessage: string, categoryId: string) {
    const responses = {
      chat: `I'm here to help with whatever you need! Let's dive into "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}". What specific aspect would you like to explore?`,
      code: `I'll help you with your coding question about "${userMessage.substring(0, 40)}${userMessage.length > 40 ? '...' : ''}". Let me provide you with a detailed solution:\n\n\`\`\`javascript\n// Example code solution\nfunction example() {\n  return "This is a sample response";\n}\n\`\`\`\n\nWould you like me to explain this further or help with any specific part?`,
      image: `I understand you want help with image processing. For "${userMessage.substring(0, 40)}${userMessage.length > 40 ? '...' : ''}", I can help you with image generation, editing, or analysis. What specific image task would you like assistance with?`,
      document: `I'll analyze your document request about "${userMessage.substring(0, 40)}${userMessage.length > 40 ? '...' : ''}". I can help with document analysis, summarization, or content extraction. Please share your document or let me know what specific analysis you need.`,
      writing: `Great topic for creative writing! For "${userMessage.substring(0, 40)}${userMessage.length > 40 ? '...' : ''}", I can help you craft compelling content. Would you like me to help with:\n\n• **Story development**\n• **Character creation**\n• **Plot structure**\n• **Writing style**\n\nWhat aspect interests you most?`,
      knowledge: `Excellent question about "${userMessage.substring(0, 40)}${userMessage.length > 40 ? '...' : ''}". Let me provide you with comprehensive information on this topic. Based on current knowledge, here are the key points you should know...`,
      voice: `I heard your voice input about "${userMessage.substring(0, 40)}${userMessage.length > 40 ? '...' : ''}". I can help process voice commands and provide spoken responses. What would you like to discuss or accomplish through voice interaction?`
    };
    
    return responses[categoryId as keyof typeof responses] || responses.chat;
  }

  const handleInsertPrompt = (prompt: string) => {
    // This would typically set the input value in ChatInput
    // For now, we'll simulate adding it as a message
    handleSendMessage(prompt);
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
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

      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 relative z-10">
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
            
            <div className="ml-auto">
              <button
                onClick={() => setShowAdvancedTools(!showAdvancedTools)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAdvancedTools
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Advanced Tools
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex relative">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col relative">
            {/* Chat Messages Area */}
            <div 
              ref={chatContainerRef} 
              className={`flex-1 overflow-y-auto ${isNewChat ? 'flex items-center justify-center' : 'p-6 pb-32'}`}
              style={{ paddingBottom: isNewChat ? '8rem' : '8rem' }}
            > 
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
                  <div className="space-y-6">
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
                          <MessageRenderer message={message} />
                          <span className={`block text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {isTyping && <TypingIndicator />}
                </>
              )}
            </div>

            {/* Chat Input - Fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/80 dark:via-gray-900/80 to-transparent">
              <div className="max-w-4xl mx-auto">
                <ChatInput 
                  onSend={handleSendMessage}
                  placeholder={`Ask your ${category.label} anything...`}
                />
              </div>
            </div>
          </div>

          {/* Advanced Tools Panel */}
          {showAdvancedTools && (
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
              <Tabs defaultValue="rag" className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rag" className="flex items-center space-x-1">
                      <FileSearch className="w-4 h-4" />
                      <span className="hidden sm:inline">RAG</span>
                    </TabsTrigger>
                    <TabsTrigger value="prompts" className="flex items-center space-x-1">
                      <Lightbulb className="w-4 h-4" />
                      <span className="hidden sm:inline">Prompts</span>
                    </TabsTrigger>
                    <TabsTrigger value="memory" className="flex items-center space-x-1">
                      <Database className="w-4 h-4" />
                      <span className="hidden sm:inline">Memory</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="rag" className="flex-1">
                  <RAGExplorer />
                </TabsContent>
                
                <TabsContent value="prompts" className="flex-1">
                  <PromptLab onInsertPrompt={handleInsertPrompt} />
                </TabsContent>
                
                <TabsContent value="memory" className="flex-1">
                  <MemoryModule />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}