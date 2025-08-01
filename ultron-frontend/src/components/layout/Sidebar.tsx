import React from 'react';
import { History, Settings, Bookmark, Trash2 } from 'lucide-react';

interface SidebarProps {
  title: string;
  children?: React.ReactNode;
}

export function Sidebar({ title, children }: SidebarProps) {
  const menuItems = [
    { icon: History, label: 'Recent', count: 12 },
    { icon: Bookmark, label: 'Saved', count: 3 },
    { icon: Settings, label: 'Settings' },
    { icon: Trash2, label: 'Trash', count: 2 },
  ];

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-6">{title}</h2>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
            </div>
            {item.count && (
              <span className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>
      
      {children}
    </div>
  );
}