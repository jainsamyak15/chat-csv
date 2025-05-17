'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/upload/FileUpload';
import { FileList } from '@/components/upload/FileList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { VisualizationPanel } from '@/components/visualization/VisualizationPanel';

export default function Home() {
  const [selectedFileId, setSelectedFileId] = useState<string>();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Chat CSV
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Upload your CSV files and chat with your data
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Upload CSV File
              </h2>
              <FileUpload />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Data Visualization
            </h2>
            <VisualizationPanel selectedFileId={selectedFileId} />
          </div>
        </div>
      </div>
    </main>
  );
} 