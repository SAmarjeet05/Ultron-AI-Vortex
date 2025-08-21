import React from 'react';
import { 
  Brain, 
  Code, 
  Image, 
  FileText, 
  PenTool, 
  HelpCircle, 
  Mic, 
  Settings 
} from 'lucide-react';
import { Card } from './ui/Card';
import type { NavigationCard } from '../types';

interface TopNavigationProps {
  onCardClick: (card: NavigationCard) => void;
}

const navigationCards: NavigationCard[] = [
  {
    id: 'chat',
    slug: 'chat',
    icon: 'Brain',
    label: 'Chat Assistant',
    color: '#3B82F6',
    description: 'General AI conversations'
  },
  {
    id: 'code',
    slug: 'Code', 
    icon: 'Code',
    label: 'Code Companion',
    color: '#14B8A6',
    description: 'Programming help & debugging'
  },
  {
    id: 'image',
    slug: 'Image',
    icon: 'Image',
    label: 'Image Processing',
    color: '#8B5CF6',
    description: 'Generate and edit images'
  },
  {
    id: 'document',
    slug: 'Document',
    icon: 'FileText',
    label: 'Document Analyzer',
    color: '#F97316',
    description: 'Analyze and process documents'
  },
  {
    id: 'writing',
    slug: 'Writing',
    icon: 'PenTool',
    label: 'Creative Writing',
    color: '#EF4444',
    description: 'Stories, articles & content'
  },
  {
    id: 'knowledge',
    slug: 'Knowledge',
    icon: 'HelpCircle',
    label: 'Knowledge Q&A',
    color: '#10B981',
    description: 'Research and factual queries'
  },
  {
    id: 'voice',
    slug: 'Voice',
    icon: 'Mic',
    label: 'Voice Assistant',
    color: '#F59E0B',
    description: 'Speech-to-text conversations'
  },
  {
    id: 'settings',
    slug: 'Settings',
    icon: 'Settings',
    label: 'Settings',
    color: '#6B7280',
    description: 'Configure your assistant'
  }
];

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

export function TopNavigation({ onCardClick }: TopNavigationProps) {
  return (
    <div className="px-6 pt-4 pb-2 w-full">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between w-full mb-6">
        {/* Left: Logo and Name */}
        <div className="flex items-center space-x-3">
          <img src="/logo.svg" alt="Ultron Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Ultron AI Vortex</span>
        </div>
        {/* Center: Search Input */}
        <div className="flex-1 flex justify-center">
          <input
            type="text"
            placeholder="Search chats or content"
            className="w-full max-w-lg px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Choose a feature to get started</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">AI-powered productivity at your fingertips</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {navigationCards.map((card) => {
          const IconComponent = iconMap[card.icon as keyof typeof iconMap];
          return (
            <Card
              key={card.id}
              icon={IconComponent}
              title={card.label}
              description={card.description}
              color={card.color}
              onClick={() => onCardClick(card)}
              className="hover:shadow-xl"
            />
          );
        })}
      </div>
    </div>
  );
}