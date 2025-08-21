import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Download, ExternalLink, X, Copy, Pencil, Mic, StopCircle, Send } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import type { Message } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface MessageRendererProps {
  message: Message;
  onEditMessage?: (id: string, newText: string) => void;
}

export function MessageRenderer({ message, onEditMessage }: MessageRendererProps) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessageText, setEditMessageText] = useState(message.text);

  const openImageFullScreen = (url: string) => {
    setFullscreenImage(url);
  };

  const renderMarkdown = (text: string) => (
    <div className="prose dark:prose-invert">


      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 text-gray-800 dark:text-gray-200">{children}</p>,
          ul: ({ children }) => <ul className="list-disc ml-5 text-gray-800 dark:text-gray-200">{children}</ul>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        }}
      >
        {text}
      </ReactMarkdown>

    </div>
  );

  const {
    startListening,
    stopListening,
    isListening
  } = useSpeechRecognition((newChunk: string) => {
    setEditMessageText((prev) => prev + " " + newChunk); // ✅ Append
  });

  const renderContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <React.Fragment key={`md-${keyIndex++}`}>
            {renderMarkdown(text.slice(lastIndex, match.index))}
          </React.Fragment>
        );
      }

      const language = match[1] || 'text';
      const code = match[2];

      parts.push(
        <CodeBlock key={`cb-${keyIndex++}`} code={code} language={language} />
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <React.Fragment key={`md-${keyIndex++}`}>
          {renderMarkdown(text.slice(lastIndex))}
        </React.Fragment>
      );
    }

    return parts.length > 0 ? parts : renderMarkdown(text);
  };
  const rawText = typeof message.text === 'string' ? message.text : '';
  // console.log("Raw message.text:", message.text);
  const cleanText = rawText
    .replace(/\[image:[^\]]+\]/g, '')
    .replace(/\[file:[^\]]+\]/g, '')
    .trim();


  //console.log("Rendering message with cleanText:", cleanText);

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-3 mt-2">
        {message.attachments.map((att) => {
          const badge = (
            <span className="absolute top-1 right-1 text-xs bg-white text-gray-700 px-1 rounded shadow-sm">
              {att.type}
            </span>
          );

          if (att.type === 'image') {
            return (
              <div className="relative" key={att.id}>
                <img
                  src={att.url}
                  alt="attachment"
                  className="w-32 h-32 object-cover rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700"
                  onClick={() => att.url && openImageFullScreen(att.url)}
                />
                {badge}
              </div>
            );
          } else {
            return (
              <div
                key={att.id}
                className="relative p-3 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center space-x-2 border dark:border-gray-600"
              >
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {att.file?.name || att.url}
                </span>
                {att.file ? (
                  <a
                    href={att.url}
                    download={att.file.name}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                ) : (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {badge}
              </div>
            );
          }
        })}
      </div>
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanText);
  };

  const handleEditSend = () => {
    if (onEditMessage) {
      onEditMessage(message.id, editMessageText.trim());
    }
    stopListening();
    setIsEditing(false);
  };

  return (
    <div className="relative group">
      {/* Attachments shown first */}
      {renderAttachments()}

      {/* Message content */}
      {cleanText && (
        <div className="mt-2 mb-1 text-base break-words">
          {renderContent(cleanText)}
        </div>
      )}

      {/* Action Icons (Copy, Edit) */}
      {message.sender === 'user' && (
        <div className="flex gap-2 mt-2 text-white dark:text-gray-500">
          <button
            onClick={() => navigator.clipboard.writeText(message.text)}
            className="hover:text-green-400 dark:hover:text-green-400 transition"
            title="Copy message"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsEditing(true);
              setEditMessageText(message.text);
            }}
            className="hover:text-red-400 dark:hover:text-red-400 transition"
            title="Edit message"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      )}



      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
          <img
            src={fullscreenImage}
            alt="Full view"
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white text-3xl"
          >
            <X />
          </button>
        </div>
      )}

      {/* Edit Mode Popup */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg w-full max-w-xl space-y-4">
            <textarea
              value={editMessageText}
              onChange={(e) => setEditMessageText(e.target.value)}
              className="w-full resize-none p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-within:border-blue-500 focus-within:shadow-md"
              placeholder="Edit your message..."
              rows={3}
            />
            <div className="flex justify-between">
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => (isListening ? stopListening() : startListening())}
                  className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  aria-label="Toggle voice input"
                >
                  {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleEditSend}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <Send className="w-4 h-4 inline mr-1" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
