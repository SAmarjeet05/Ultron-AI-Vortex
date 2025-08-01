import React, { useState } from 'react';
import { Upload, FileText, Search, Eye, Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface DocumentData {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  summary: string;
  chunks: Array<{
    id: string;
    content: string;
    page?: number;
  }>;
}

export function RAGExplorer() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const mockDoc: DocumentData = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toLocaleDateString(),
        summary: `This is a mock summary of ${file.name}. The document contains important information about various topics and has been processed for RAG analysis.`,
        chunks: [
          {
            id: '1',
            content: `Sample content from ${file.name}. This would be the actual extracted text from the document.`,
            page: 1
          },
          {
            id: '2',
            content: `Additional content chunk from ${file.name}. This represents another section of the document.`,
            page: 2
          }
        ]
      };
      
      setDocuments(prev => [...prev, mockDoc]);
    });
    
    // Reset file input
    event.target.value = '';
  };

  const filteredChunks = selectedDoc?.chunks.filter(chunk =>
    chunk.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          RAG Data Explorer
        </h2>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Upload Documents</span>
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.docx,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search document content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Document List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Documents</h3>
          
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedDoc?.id === doc.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {doc.size} • {doc.uploadDate}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Details */}
        <div className="flex-1 p-4">
          {selectedDoc ? (
            <div className="h-full flex flex-col">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedDoc.name}
                  </h3>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Auto-Generated Summary
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    {selectedDoc.summary}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Content Chunks ({filteredChunks.length})
                </h4>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredChunks.map(chunk => (
                    <div
                      key={chunk.id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Chunk {chunk.id} {chunk.page && `• Page ${chunk.page}`}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {chunk.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a document to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}