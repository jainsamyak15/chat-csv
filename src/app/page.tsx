'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/upload/FileUpload';
import { FileList } from '@/components/upload/FileList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { VisualizationPanel } from '@/components/visualization/VisualizationPanel';
import { motion } from 'framer-motion';
import { Bot, FileText, LineChart } from 'lucide-react';

export default function Home() {
  const [selectedFileId, setSelectedFileId] = useState<string>();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4 py-8">
        <motion.header 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/70 to-primary bg-clip-text text-transparent animate-gradient">
            Chat with Your CSV Data
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your CSV files and interact with your data using natural language. Get instant insights and visualizations powered by AI.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Upload CSV File</h2>
              </div>
              <FileUpload />
            </div>

            <div className="card bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Chat with Your Data</h2>
              </div>
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
          </motion.div>

          <motion.div 
            className="card bg-card rounded-xl p-6 border shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <LineChart className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Data Visualization</h2>
            </div>
            <VisualizationPanel selectedFileId={selectedFileId} />
          </motion.div>
        </div>
      </div>
    </main>
  );
}