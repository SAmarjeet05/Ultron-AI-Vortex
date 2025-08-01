import React from 'react';
import { Clock, ExternalLink, Download, Trash2 } from 'lucide-react';
import type { Conversation } from '../types';

interface RecentConversationsProps {
  conversations: Conversation[];
  onOpen: (conversation: Conversation) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

export function RecentConversations({ 
  conversations, 
  onOpen, 
  onDelete, 
  onExport 
}: RecentConversationsProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Recent Conversations
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Continue where you left off or start fresh
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getCategoryColor(conversation.category) }}
                />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {conversation.category}
                </span>
              </div>
              <div className="flex items-center text-gray-400 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {conversation.timestamp}
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {conversation.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {conversation.lastMessage}
            </p>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpen(conversation)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open</span>
              </button>
              
              <button
                onClick={() => onExport(conversation.id)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Export"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onDelete(conversation.id)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {conversations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No conversations yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start by choosing a feature from the cards above
          </p>
        </div>
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