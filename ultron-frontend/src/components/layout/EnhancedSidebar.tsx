import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, Download, Bookmark, Trash2, Edit3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DropdownMenu, DropdownMenuItem } from '../ui/DropdownMenu';
import type { Conversation } from '../../types';

interface EnhancedSidebarProps {
  title: string;
  categorySlug: string;
  chats: Conversation[];
  activeChatId?: string;
  onCreateNewChat: () => void;
  onSelectChat: (chat: Conversation) => void;
  onExportChat: (chatId: string) => void;
  onSaveChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
}



export function EnhancedSidebar({
  title,
  categorySlug,
  chats,
  activeChatId,
  onCreateNewChat,
  onSelectChat,
  onExportChat,
  onSaveChat,
  onDeleteChat,
  onRenameChat
}: EnhancedSidebarProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const [modalDeleteId, setModalDeleteId] = useState<string | null>(null);
  const filteredChats = !searchQuery.trim()
    ? chats
    : chats.filter(chat => {
      const query = searchQuery.toLowerCase();
      return (
        chat.title.toLowerCase().includes(query) ||
        (chat.timestamp && chat.timestamp.toLowerCase().includes(query)) ||
        (chat.lastMessage && chat.lastMessage.toLowerCase().includes(query))
      );
    });


  const handleModalDelete = () => {
    if (modalDeleteId) {
      onDeleteChat(modalDeleteId);
      setModalDeleteId(null);
    }
  };

  const handleModalCancel = () => {
    setModalDeleteId(null);
  };

  const handleDeleteClick = (chatId: string) => {
    setModalDeleteId(chatId);
  };

  const handleRenameClick = (chat: Conversation) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title || formatChatTitle(chat));
  };

  // Export chat as JSON
  const handleExportClick = (chat: Conversation) => {
    // Export as JSON
    const exportData = {
      id: chat.id,
      title: chat.title,
      category: chat.category,
      messages: chat.messages || [],
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      exportedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${chat.title || 'chat'}-${chat.id}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRenameSubmit = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleRenameCancel = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  type ExtendedConversation = Conversation & {
    chat_name?: string;
    created_at?: string;
  };


  const formatChatTitle = (chat: ExtendedConversation) => {
    if (chat.chat_name && chat.chat_name.trim() !== "") {
      return chat.chat_name;
    }

    return "Untitled Chat";
  };








  const formatTimestamp = (chat: Conversation & { created_at?: string }) => {
    const dateValue = chat.created_at || chat.updatedAt || chat.timestamp;

    if (!dateValue) return "Unknown date";

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Unknown date";

    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };



  

  return (
    <aside className="w-64 bg-muted/30 dark:bg-muted/20 border-r border-border flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground mb-4">{title}</h2>
        <Button
          variant="default"
          size="sm"
          onClick={onCreateNewChat}
          className="w-full mb-2 hover:bg-opacity-90 active:scale-95 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-2"
        />
      </div>
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`
                    group relative flex items-center p-3 rounded-lg cursor-pointer
                    transition-all duration-200 hover:bg-muted/50 min-h-[44px]
                    ${activeChatId === chat.id
                      ? 'bg-muted border-l-4 border-primary'
                      : 'hover:bg-muted/30'
                    }
                  `}
                  onClick={() => onSelectChat(chat)}
                  role="button"
                  tabIndex={0}
                  aria-label={editingChatId === chat.id ? 'Editing chat title' : `Open chat: ${formatChatTitle(chat)}`}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && editingChatId !== chat.id) {
                      e.preventDefault();
                      onSelectChat(chat);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    {editingChatId === chat.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleRenameSubmit(chat.id)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') {
                            handleRenameSubmit(chat.id);
                          } else if (e.key === 'Escape') {
                            handleRenameCancel();
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none font-medium text-foreground"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="font-medium text-foreground truncate">
                        {formatChatTitle(chat)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(chat)}
                    </div>
                  </div>
                  <div className="transition-opacity duration-200">
                    <DropdownMenu
                      trigger={
                        <button
                          className="p-1 hover:bg-muted rounded transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Chat options"
                        >
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      }
                    >
                      <DropdownMenuItem onClick={() => handleRenameClick(chat)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportClick(chat)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSaveChat(chat.id)}>
                        <Bookmark className="w-4 h-4 mr-2" />
                        Save
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(chat.id)}
                        destructive
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Modal for delete confirmation */}
      {modalDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 min-w-[320px] max-w-xs text-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Confirm Deletion</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">Are you sure you want to delete this chat?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={handleModalCancel}
              >Cancel</button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
                onClick={handleModalDelete}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}