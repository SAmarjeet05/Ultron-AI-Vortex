import React from 'react';
import { Brain } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shadow mr-2">
        <Brain className="w-5 h-5 text-blue-500" />
      </div>
      <div className="max-w-2xl px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 flex items-center shadow-sm">
        <span className="mr-2 text-gray-600 dark:text-gray-400">Ultron is thinking</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}