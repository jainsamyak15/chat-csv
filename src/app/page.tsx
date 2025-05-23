'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/upload/FileUpload';
import { FileList } from '@/components/upload/FileList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { VisualizationPanel } from '@/components/visualization/VisualizationPanel';

export default function Home() {
  const [selectedFileId, setSelectedFileId] = useState<string>();

  return (
    <main className="min-h-screen bg-dark text-primary">
      <div className="container mx-auto p-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 animate-glow inline-block">
            Chat CSV
          </h1>
          <p className="text-primary/70">
            Upload your CSV files and chat with your data using natural language
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">
                Upload CSV File
              </h2>
              <FileUpload />
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4">
                Chat with Your Data
              </h2>
              <FileList
                selectedFileId={selectedFileId}
                onFileSelect={setSelectedFileId}
              />
              {selectedFileId && (
                <div className="mt-4">
                  <ChatInterface fileId={selectedFileId} />
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              Data Visualization
            </h2>
            <VisualizationPanel selectedFileId={selectedFileId} />
          </div>
        </div>
      </div>
    </main>
  );
}