import React, { useState } from 'react';
import { ArrowLeft, User, Bell, Shield, Palette, Globe, Database, Zap, Settings } from 'lucide-react';
import { Sidebar } from './layout/Sidebar';
import type { CategoryDetailProps } from '../types';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

const settingSections: SettingSection[] = [
  {
    id: 'profile',
    title: 'Profile & Account',
    icon: User,
    description: 'Manage your personal information and account settings'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    description: 'Configure how and when you receive notifications'
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: Shield,
    description: 'Control your privacy settings and security preferences'
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: Palette,
    description: 'Customize the look and feel of your interface'
  },
  {
    id: 'language',
    title: 'Language & Region',
    icon: Globe,
    description: 'Set your preferred language and regional settings'
  },
  {
    id: 'data',
    title: 'Data & Storage',
    icon: Database,
    description: 'Manage your data, backups, and storage preferences'
  },
  {
    id: 'performance',
    title: 'Performance',
    icon: Zap,
    description: 'Optimize performance and resource usage'
  }
];

export function SettingsView({ category, onBack }: CategoryDetailProps) {
  const [activeSection, setActiveSection] = useState<string>('profile');

  const renderSettingContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter your display name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter your email"
              />
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Desktop Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Show notifications on your desktop</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Sound Alerts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Play sound for notifications</p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Theme Preference</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input type="radio" name="theme" value="light" className="text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Light Mode</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="theme" value="dark" className="text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="theme" value="system" className="text-blue-500" defaultChecked />
                  <span className="text-gray-700 dark:text-gray-300">System Default</span>
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Settings for {activeSection} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar title="Settings">
        <div className="mt-8">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Categories</h3>
          <div className="space-y-1">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors
                  ${activeSection === section.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <section.icon className="w-4 h-4" />
                <span className="text-sm">{section.title}</span>
              </button>
            ))}
          </div>
        </div>
      </Sidebar>

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
              <Settings className="w-6 h-6" style={{ color: category.color }} />
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

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            {/* Active Section Header */}
            <div className="mb-6">
              {settingSections.map((section) => {
                if (section.id === activeSection) {
                  const IconComponent = section.icon;
                  return (
                    <div key={section.id} className="flex items-center space-x-3">
                      <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {section.title}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Settings Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              {renderSettingContent()}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}