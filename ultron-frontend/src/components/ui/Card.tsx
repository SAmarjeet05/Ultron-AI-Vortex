import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface CardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  color: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function Card({ icon: Icon, title, description, color, onClick, className = '', children }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700
        transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer
        ${className}
      `}
      style={{
        boxShadow: `0 4px 20px ${color}20`,
      }}
    >
      <div className="flex items-center space-x-4">
        <div 
          className={`p-3 rounded-lg`}
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}