import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Brain,
  Code,
  Image,
  FileText,
  Pencil,
  HelpCircle,
  Mic,
  Settings,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { EnhancedSidebar } from './layout/EnhancedSidebar';
import ChatInput from './ui/ChatInput';
import { MessageRenderer } from './ui/MessageRenderer';

import type { CategoryDetailProps, Message, Conversation, FilePreview } from '../types';

const iconMap = { Brain, Code, Image, FileText, Pencil, HelpCircle, Mic, Settings };

const modelEndpointMap: Record<string, string> = {
  chat: 'llama3-chat',
  code: 'deepseek-coder',
  image: 'llava',
  document: 'llama3-document',
  writing: 'llama3-writing',
  knowledge: 'llama3-knowledge',
  voice: 'llama3-voice',
};

export function CategoryDetailView({
  category,
  onBack,
  chatsByCategory = {},
  onCreateNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  // optional props that App may pass (we accept them but keep backwards compatibility)
  activeChatId: propActiveChatId,
  messages: propMessages,
  onSendMessage: propOnSendMessage,
}: CategoryDetailProps & {
  activeChatId?: string;
  messages?: Message[];
  onSendMessage?: (text: string, attachments?: FilePreview[]) => Promise<void>;
}) {
  const categorySlug = category.id;
  const categoryChats = chatsByCategory[categorySlug] || [];
  const [activeChatId, setActiveChatId] = useState<string | undefined>(propActiveChatId);
  const [messages, setMessages] = useState<Message[]>(propMessages ?? []);
  const [isNewChat, setIsNewChat] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userSentRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  // Sync with parent props when provided
  useEffect(() => {
    if (propActiveChatId !== undefined) {
      setActiveChatId(propActiveChatId);
    }
  }, [propActiveChatId]);

  useEffect(() => {
    if (propMessages !== undefined) {
      setMessages(propMessages);
      setIsNewChat((propMessages ?? []).length === 0);
    }
  }, [propMessages]);

  // Reset on category change
  useEffect(() => {
    setIsNewChat(true);
    setMessages([]);
    // Only clear local activeChatId if parent didn't supply it
    if (propActiveChatId === undefined) setActiveChatId(undefined);
  }, [categorySlug]);

  const scrollToBottom = (smooth = true) => {
    // small safety: wait a tick so content renders
    setTimeout(() => {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current?.scrollHeight ?? 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }, 50);
  };

  const streamAIResponse = async (text: string, model: string, chatId?: string) => {
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    // Build a clean history: include only entries that have text/content
    const historyPayload = messages
      .map((m) => {
        const content = (m as any).text ?? (m as any).content ?? '';
        const role = m.sender === 'user' ? 'user' : 'assistant';
        // return content ? { role, content, chat_id: (m as any).chat_id ?? undefined } : null;
        return content ? { role, content } : null;
      })
      .filter(Boolean);

    const body = {
      chat_id: chatId,
      message: text,
      category: category.id,      // <-- required by backend
      history: historyPayload,
      filenames: [],
    };

    const response = await fetch(`http://localhost:8000/chat/${model}/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let aiText = '';

    if (!reader) throw new Error('No reader available for streaming');

    setMessages((prev) => [
      ...prev,
      {
        id: 'streaming-ai',
        chat_id: chatId,
        text: '',
        sender: 'ai',
        createdAt: new Date(),
        temp: true,
      } as Message,
    ]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      aiText += decoder.decode(value, { stream: true });

      setMessages((prev) =>
        prev.map((msg) =>
          (msg as any).temp && msg.sender === 'ai' ? { ...msg, text: aiText } : msg
        )
      );
    }

    // Finalize temp message
    setMessages((prev) =>
      prev.map((msg) =>
        (msg as any).temp && msg.sender === 'ai'
          ? { ...msg, text: aiText, id: Date.now().toString(), temp: false }
          : msg
      )
    );
  };


  // Use parent's send when available, otherwise fallback to local streaming
  const handleSendMessage = async (text: string, attachments?: FilePreview[]) => {
    // Ensure there's a chat id on the server before sending anything
    let chatId = activeChatId;

    if (!chatId) {
      try {
        const createRes = await fetch('http://localhost:8000/chats/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_name: 'New Chat',
            slug: categorySlug,
          }),
        });
        if (!createRes.ok) {
          console.warn('Failed to create chat on server, falling back to local id:', await createRes.text());
          chatId = Date.now().toString();
        } else {
          const created = await createRes.json();
          chatId = created.id ?? (created.data && created.data.id) ?? Date.now().toString();
        }
        setActiveChatId(chatId);
      } catch (err) {
        console.error('Error creating chat on server, falling back to local id', err);
        chatId = Date.now().toString();
        setActiveChatId(chatId);
      }
    }

    if (isNewChat) setIsNewChat(false);
    userSentRef.current = true;

    // Create local (temporary) user message for UI
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      createdAt: new Date(),
      attachments: attachments?.length ? attachments : undefined,
      ...(chatId ? ({ chat_id: chatId } as any) : {}),
    } as Message;

    // add it to UI
    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);
    scrollToBottom();

    // Persist the user message to the server under this chat (so backend knows owner)
    try {
      const persistRes = await fetch(`http://localhost:8000/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // adapt payload to your backend; many APIs expect { sender, text } or { role, content }
        body: JSON.stringify({
          sender: 'user',
          text,
        }),
      });

      if (!persistRes.ok) {
        // not fatal — streaming can continue — but log
        console.warn('Failed to persist user message to server:', await persistRes.text());
      }
    } catch (err) {
      console.error('Error persisting user message to server:', err);
    }

    const model = modelEndpointMap[categorySlug] || 'mistral';

    try {
      // start streaming assistant response and ensure we pass chatId
      await streamAIResponse(text, model, chatId);
    } catch (err) {
      if ((err as any).name !== 'AbortError') {
        console.error('Streaming failed:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            text: '❌ Failed to get response from server.',
            sender: 'ai',
            createdAt: new Date(),
          } as Message,
        ]);
      }
    } finally {
      setIsTyping(false);
    }
  };



  const stopStreaming = () => {
    controllerRef.current?.abort();
    setIsTyping(false);
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollDown(distanceFromBottom > 300);
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (userSentRef.current) {
      scrollToBottom();
      userSentRef.current = false;
    }
  }, [messages]);

  const handleEditMessage = useCallback(
    async (id: string, newText: string) => {
      setMessages((prevMessages) => {
        const updatedMessages: Message[] = [];
        let skipNext = false;

        for (let i = 0; i < prevMessages.length; i++) {
          const current = prevMessages[i];
          if (skipNext) {
            skipNext = false;
            continue;
          }
          if (current.id === id) {
            updatedMessages.push({ ...current, text: newText });
            if (i + 1 < prevMessages.length && prevMessages[i + 1].sender === 'ai') {
              skipNext = true;
            }
          } else {
            updatedMessages.push(current);
          }
        }

        return updatedMessages;
      });

      setIsTyping(true);
      const model = modelEndpointMap[categorySlug] || 'mistral';

      try {
        await streamAIResponse(newText, model, propActiveChatId ?? activeChatId);
      } catch (error) {
        console.error('Edit message fetch failed:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + '-ai',
            text: '❌ Failed to update response.',
            sender: 'ai',
            createdAt: new Date(),
          } as Message,
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [categorySlug, activeChatId, propActiveChatId]
  );

  const handleCreateNewChat = async () => {
    setMessages([]);
    setIsNewChat(true);

    // If parent provided a creator, call it and use the returned chat id
    if (onCreateNewChat) {
      try {
        // cast to any to avoid mismatched prop typing if your types aren't updated
        const newChat = await (onCreateNewChat as any)(categorySlug);
        if (newChat && newChat.id) {
          setActiveChatId(newChat.id);
        } else if (propActiveChatId === undefined) {
          // fallback to clear local active id
          setActiveChatId(undefined);
        }
      } catch (err) {
        console.error('onCreateNewChat failed:', err);
        if (propActiveChatId === undefined) setActiveChatId(undefined);
      }
      return;
    }

    // Parent not provided -> fallback behavior (local-only)
    if (propActiveChatId === undefined) setActiveChatId(undefined);
  };


  // When a chat is selected in the sidebar: call parent if provided; otherwise do local fetch
  const handleSelectChat = async (chat: Conversation) => {
    try {
      setActiveChatId(chat.id);

      const res = await fetch(`http://localhost:8000/chats/${chat.id}/messages`);
      if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
      const data = await res.json();

      const mapped: Message[] = (Array.isArray(data) ? data : []).map((m: any, idx: number) => {
        const text = m.text ?? m.content ?? m.body ?? m.message ?? '';
        const role = (m.role ?? m.sender ?? '').toString().toLowerCase();
        const sender = role === 'user' || role === 'human' ? 'user' : 'ai';
        const rawDate = m.createdAt ?? m.created_at ?? m.timestamp;
        const createdAt = rawDate ? new Date(rawDate) : new Date();
        return {
          id: m.id ?? m.message_id ?? `msg-${Date.now()}-${idx}`,
          text,
          sender,
          createdAt,
          ...(m.chat_id ? { chat_id: m.chat_id } : {}),
        } as Message;
      });

      setMessages(mapped);
      setIsNewChat(mapped.length === 0);
      setTimeout(() => scrollToBottom(false), 60);
    } catch (err) {
      console.error('Error loading chat messages (local fallback):', err);
      setIsNewChat(false);
      setMessages([]);
    }
  };


  const handleRenameChat = (chatId: string, newTitle: string) => {
    if (onRenameChat) onRenameChat(chatId, newTitle, categorySlug);
  };
  const handleDeleteChat = (chatId: string) => {
    if (onDeleteChat) onDeleteChat(chatId, categorySlug);
  };

  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Brain;

  // ---------- messages container helper ----------
  const messagesContainer = (
    <div className="space-y-6 max-w-4xl w-full px-6">
      {isNewChat ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
            <IconComponent className="w-8 h-8" style={{ color: category.color }} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start a new conversation</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Ask me anything about {category.label.toLowerCase()}. I'm here to help!</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-4 h-4" />
            <span>Type your message below to get started</span>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
            {message.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shadow mr-2">
                <Brain className="w-5 h-5 text-blue-500" />
              </div>
            )}
            <div className={`max-w-2xl px-4 py-3 rounded-2xl shadow-sm ${message.sender === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'}`} style={{ boxShadow: message.sender === 'user' ? '0 2px 8px #3B82F640' : '0 2px 8px #0001' }}>
              <MessageRenderer message={message} onEditMessage={handleEditMessage} />
            </div>
          </div>
        ))
      )}
    </div>
  );
  // -----------------------------------------------

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <EnhancedSidebar
        key={categorySlug + '-' + categoryChats.map((c) => c.title).join(',')}
        title="Recent Chats"
        categorySlug={categorySlug}
        chats={categoryChats}
        activeChatId={propActiveChatId ?? activeChatId}
        onCreateNewChat={handleCreateNewChat}
        onSelectChat={handleSelectChat}
        onExportChat={(chatId) => console.log('Export chat:', chatId)}
        onSaveChat={(chatId) => console.log('Save chat:', chatId)}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />

      <div className="flex-1 flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
              <IconComponent className="w-6 h-6" style={{ color: category.color }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{category.label}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-2 flex flex-col h-full min-h-0 relative">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto min-h-0 flex justify-center" style={{ maxHeight: 'calc(100vh - 120px - 90px)' }}>
            {messagesContainer}
            {showScrollDown && (
              <button onClick={() => scrollToBottom()} className="fixed bottom-28 left-1/2 transform translate-x-[250%] bg-blue-500 text-white p-2 rounded-full shadow-lg">
                <ChevronDown className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Chat Input */}
          <div className="sticky bottom-0 left-0 w-full px-6 pb-6 z-10 max-w-2xl mx-auto relative">
            <ChatInput
              onSend={(text, attachments) => handleSendMessage(text, attachments)}
              placeholder={`Ask your ${category.label} anything...`}
              autoGrow
              isTyping={isTyping}
              onStop={stopStreaming}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
