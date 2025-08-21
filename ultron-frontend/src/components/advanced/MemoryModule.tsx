import React, { useState } from 'react';
import { Brain, Toggle, Trash2, Plus, Edit3, Save, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface MemoryItem {
  id: string;
  type: 'goal' | 'fact' | 'preference';
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const mockMemoryItems: MemoryItem[] = [
  {
    id: '1',
    type: 'goal',
    title: 'Learn React Development',
    content: 'User wants to become proficient in React development, focusing on hooks and modern patterns.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    type: 'fact',
    title: 'Preferred Programming Language',
    content: 'User prefers TypeScript over JavaScript for better type safety.',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    type: 'preference',
    title: 'Communication Style',
    content: 'User prefers detailed explanations with code examples and step-by-step instructions.',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '4',
    type: 'goal',
    title: 'Build Portfolio Website',
    content: 'User is working on creating a personal portfolio website using React and Tailwind CSS.',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18')
  }
];

export function MemoryModule() {
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>(mockMemoryItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'fact' as MemoryItem['type'],
    title: '',
    content: ''
  });

  const handleEdit = (item: MemoryItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditContent(item.content);
  };

  const handleSaveEdit = (id: string) => {
    setMemoryItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, title: editTitle, content: editContent, updatedAt: new Date() }
        : item
    ));
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleDelete = (id: string) => {
    setMemoryItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddNew = () => {
    if (newItem.title.trim() && newItem.content.trim()) {
      const item: MemoryItem = {
        id: Date.now().toString(),
        type: newItem.type,
        title: newItem.title.trim(),
        content: newItem.content.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setMemoryItems(prev => [item, ...prev]);
      setNewItem({ type: 'fact', title: '', content: '' });
      setShowAddForm(false);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all memory items? This action cannot be undone.')) {
      setMemoryItems([]);
    }
  };

  const getTypeColor = (type: MemoryItem['type']) => {
    switch (type) {
      case 'goal': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'fact': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'preference': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: MemoryItem['type']) => {
    switch (type) {
      case 'goal': return '🎯';
      case 'fact': return '📝';
      case 'preference': return '⚙️';
      default: return '💭';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Memory Module
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
              <button
                onClick={() => setMemoryEnabled(!memoryEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  memoryEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    memoryEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              disabled={!memoryEnabled}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Memory
            </Button>
          </div>
        </div>

        {!memoryEnabled && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Memory is currently disabled. Enable it to start tracking user preferences and context.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Add New Memory Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as MemoryItem['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="fact">Fact</option>
                  <option value="goal">Goal</option>
                  <option value="preference">Preference</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter a descriptive title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newItem.content}
                  onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter the memory content..."
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleAddNew} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItem({ type: 'fact', title: '', content: '' });
                  }}
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {memoryEnabled && memoryItems.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {memoryItems.length} memory item{memoryItems.length !== 1 ? 's' : ''}
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {memoryItems.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getTypeIcon(item.type)}</span>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingId === item.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSaveEdit(item.id)} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit} size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {item.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Created: {item.createdAt.toLocaleDateString()} • 
                    Updated: {item.updatedAt.toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {memoryEnabled && memoryItems.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Memory Items</h3>
            <p className="mb-4">Start adding memories to help the assistant remember your preferences and context.</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Memory
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}