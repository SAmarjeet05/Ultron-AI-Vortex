import React from 'react';
import { FileText, Download, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import type { Message } from '../../types';

interface MessageRendererProps {
  message: Message;
}

export function MessageRenderer({ message }: MessageRendererProps) {
  const renderContent = (text: string) => {
    // Handle code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(renderMarkdown(text.slice(lastIndex, match.index)));
      }
      
      // Add code block
      const language = match[1] || 'text';
      const code = match[2];
      parts.push(
        <CodeBlock key={match.index} code={code} language={language} />
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(renderMarkdown(text.slice(lastIndex)));
    }
    
    return parts.length > 0 ? parts : renderMarkdown(text);
  };

  const renderMarkdown = (text: string) => {
    // Handle inline code
    let html = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Handle bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    // Handle italic
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    
    // Handle links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:text-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Handle line breaks
    html = html.replace(/\n/g, '<br>');
    
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const renderAttachments = () => {
    const attachments = [];
    
    // Check for image attachments
    const imageMatch = message.text.match(/\[image:([^\]]+)\]/g);
    if (imageMatch) {
      imageMatch.forEach((match, index) => {
        const url = match.match(/\[image:([^\]]+)\]/)?.[1];
        if (url) {
          attachments.push(
            <div key={`image-${index}`} className="mt-2">
              <img 
                src={url} 
                alt="Attachment" 
                className="max-w-sm max-h-64 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => window.open(url, '_blank')}
              />
            </div>
          );
        }
      });
    }
    
    // Check for file attachments
    const fileMatch = message.text.match(/\[file:([^\]]+)\]/g);
    if (fileMatch) {
      fileMatch.forEach((match, index) => {
        const filename = match.match(/\[file:([^\]]+)\]/)?.[1];
        if (filename) {
          const isUrl = filename.startsWith('http');
          attachments.push(
            <div key={`file-${index}`} className="mt-2 flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{filename}</span>
              {isUrl ? (
                <button
                  onClick={() => window.open(filename, '_blank')}
                  className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              ) : (
                <button
                  className="p-1 text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        }
      });
    }
    
    return attachments;
  };

  // Clean text for display (remove attachment markup)
  const cleanText = message.text
    .replace(/\[image:[^\]]+\]/g, '')
    .replace(/\[file:[^\]]+\]/g, '')
    .trim();

  return (
    <div>
      {cleanText && (
        <div className="mb-1 text-base break-words">
          {renderContent(cleanText)}
        </div>
      )}
      {renderAttachments()}
    </div>
  );
}