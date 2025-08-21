import React, { useRef, useState, useEffect } from "react";
import { Paperclip, Send, Mic, StopCircle, Link as LinkIcon, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "./DropdownMenu";
import type { FilePreview } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface ChatInputProps {
  onSend: (msg: string, attachments: FilePreview[]) => void;
  placeholder?: string;
  autoGrow?: boolean;
  isTyping: boolean;
  onStop?: () => void;
}

export default function ChatInput({ onSend, isTyping, onStop }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  const handleSend = (e?: React.FormEvent | KeyboardEvent) => {
    if (e) e.preventDefault();
    console.log("handleSend called, message:", message, "attachments:", attachments);
    if (!message.trim() && attachments.length === 0) return;
    if (isListening) {
      stopListening();
    }
    onSend(message.trim(), attachments);
    setMessage("");
    setAttachments([]);
  };


  const {
    startListening,
    stopListening,
    isListening
  } = useSpeechRecognition((newChunk: string) => {
    setMessage((prev) => prev + " " + newChunk);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FilePreview[] = Array.from(files).map((file) => {
      let type: FilePreview["type"] = "file";
      const lower = file.type.toLowerCase();
      if (lower.startsWith("image/")) type = "image";
      else if (file.name.match(/\.(pdf|doc|docx|txt)$/i)) type = "document";

      return {
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        url: URL.createObjectURL(file),
        type,
      };
    });

    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleAttachLink = () => {
    const url = prompt("Paste link:");
    if (url) {
      setAttachments((prev) => [
        ...prev,
        {
          id: `${url}-${Date.now()}`,
          url,
          type: "link",
        },
      ]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDrop = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files?.length) return;

    const dropped: FilePreview[] = Array.from(e.dataTransfer.files).map((file) => {
      let type: FilePreview["type"] = "file";
      const lower = file.type.toLowerCase();
      if (lower.startsWith("image/")) type = "image";
      else if (file.name.match(/\.(pdf|doc|docx|txt)$/i)) type = "document";

      return {
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        url: URL.createObjectURL(file),
        type,
      };
    });

    setAttachments((prev) => [...prev, ...dropped]);
  };

  return (
    <form
      onSubmit={handleSend}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      className={`fixed bottom-7 left-1/2 -translate-x-[36%] max-w-4xl w-full transition
        ${isDragging ? "border-dashed border-2 border-blue-500 bg-blue-50/40" : ""}`}
    >
      {attachments.length > 0 && (
        <div className="mb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent bg-white dark:bg-gray-900 p-2 rounded-lg shadow">
          <div className="flex gap-2 min-w-max">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs relative"
              >
                {att.type === "image" && att.url && (
                  <img src={att.url} alt={att.file?.name} className="w-8 h-8 object-cover rounded" />
                )}
                {(att.type === "file" || att.type === "document") && (
                  <>
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span className="truncate max-w-[120px]">{att.file?.name}</span>
                  </>
                )}
                {att.type === "link" && att.url && (
                  <>
                    <LinkIcon className="w-4 h-4 text-gray-500" />
                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="truncate max-w-[120px] hover:underline">
                      {att.url}
                    </a>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative flex w-full">
        <div className="flex-1 flex items-center space-x-3 bg-white dark:bg-gray-900 rounded-xl p-3 border-2 focus-within:border-blue-500 focus-within:shadow-md">
          <DropdownMenu
            align="start"
            direction="up"
            trigger={
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            }
          >
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>Upload File</DropdownMenuItem>
            <DropdownMenuItem onClick={handleAttachLink}>
              Attach Link
              <LinkIcon className="ml-2 h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenu>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask your Code Companion anything..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isTyping}
            className="flex-1 resize-none bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 min-h-[40px] max-h-40 overflow-y-auto"
            style={{ lineHeight: "1.5", fontSize: "1rem" }}
          />

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => (isListening ? stopListening() : startListening())}
              className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              aria-label="Toggle voice input"
            >
              {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {isTyping ? (
              <button
                type="button"
                onClick={onStop}
                className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                <StopCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!message.trim() && attachments.length === 0}
                className={`p-2 rounded-lg transition ${message.trim() || attachments.length > 0
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"}`}
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <input
          type="file"
          hidden
          ref={fileInputRef}
          onClick={(e) => (e.currentTarget.value = "")}
          onChange={handleFileChange}
          multiple
          accept=".pdf,.docx,.txt,.csv,image/*"
        />
      </div>
    </form>
  );
}
