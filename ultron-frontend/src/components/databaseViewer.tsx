// src/components/DatabaseViewer.tsx
import React, { useEffect, useState } from 'react';

interface Message {
  role: string;
  content: string;
}

interface ChatHistory {
  id: string;
  chat_name: string;
  history: Message[];
}

export const DatabaseViewer = () => {
  const [chatData, setChatData] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/chat-history')
      .then(res => res.json())
      .then(data => {
        setChatData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading chat history...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Chat History</h2>
      <div className="space-y-4">
        {chatData.map((chat) => (
          <div key={chat.id} className="border border-gray-300 dark:border-gray-600 rounded-xl p-4 shadow-md bg-white dark:bg-gray-900">
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">{chat.chat_name || 'Unnamed Chat'}</h3>
            {chat.history.map((msg, idx) => (
              <div key={idx} className="mb-2">
                <p className={`text-sm ${msg.role === 'user' ? 'text-black dark:text-white' : 'text-green-600 dark:text-green-400'}`}>
                  <strong>{msg.role}:</strong> {msg.content}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
