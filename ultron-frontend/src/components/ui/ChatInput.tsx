import React, { useState } from 'react';
import { Send, Mic, Paperclip, Upload, FileText, Image, Link } from 'lucide-react';
import { DropdownMenu, DropdownMenuItem } from './DropdownMenu';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({ onSend, placeholder = "Type your message..." }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ type: string; name?: string; url?: string }>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      // Build markup for all attachments
      let attachmentMarkup = attachments.map(att => {
        if (att.type === 'image' && att.url) return `[image:${att.url}]`;
        if ((att.type === 'file' || att.type === 'document') && att.name) return `[file:${att.name}]`;
        return '';
      }).join(' ');
      const fullMessage = [attachmentMarkup, message.trim()].filter(Boolean).join(' ');
      onSend(fullMessage);
      setMessage('');
      setAttachments([]);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const docInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      const newAttachments = files.map(file => {
        if (type === 'image') {
          const url = URL.createObjectURL(file);
          return { type: 'image', url, name: file.name };
        } else {
          return { type, name: file.name };
        }
      });
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    e.target.value = '';
  };

  const handleAttachFile = (type: string) => {
    if (type === 'file' && fileInputRef.current) {
      fileInputRef.current.click();
    }
    if (type === 'image' && imageInputRef.current) {
      imageInputRef.current.click();
    }
    if (type === 'document' && docInputRef.current) {
      docInputRef.current.click();
    }
    if (type === 'link') {
      const url = prompt('Paste the link to attach:');
      if (url) {
        setAttachments(prev => [...prev, { type: 'file', name: url }]);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="fixed bottom-4 left-1/2 -translate-x-[30%] z-10 max-w-2xl w-full flex flex-col items-center space-y-2">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="w-full flex flex-wrap gap-3 bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-lg mb-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                {att.type === 'image' && att.url ? (
                  <img src={att.url} alt={att.name} className="w-12 h-12 object-cover rounded" />
                ) : (
                  <FileText className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[120px] truncate">{att.name}</span>
                <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}>
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          className={`
            w-full flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3
            border-2 transition-all duration-300
            ${isFocused ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-200 dark:border-gray-700'}
          `}
          style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <DropdownMenu
            trigger={
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            }
            align="start"
            direction="up"
            onClose={() => {}}
          >
            <DropdownMenuItem onClick={() => handleAttachFile('file')}>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAttachFile('document')}>
              <FileText className="w-4 h-4 mr-2" />
              Attach Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAttachFile('image')}>
              <Image className="w-4 h-4 mr-2" />
              Attach Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAttachFile('link')}>
              <Link className="w-4 h-4 mr-2" />
              Add Link
            </DropdownMenuItem>
            {/* Hidden file inputs for attachments */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, 'file')}
              accept="*"
              multiple
            />
            <input
              type="file"
              ref={imageInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, 'image')}
              accept="image/*"
              multiple
            />
            <input
              type="file"
              ref={docInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, 'document')}
              accept=".pdf,.doc,.docx,.txt"
              multiple
            />
          </DropdownMenu>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500"
          />

          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!message.trim()}
              className={`
                p-2 rounded-lg transition-all duration-300
                ${message.trim() 
                  ? 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                }
              `}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}