'use client';

import { useQuery } from '@tanstack/react-query';

interface File {
  id: string;
  name: string;
  createdAt: string;
}

interface FileListProps {
  onFileSelect: (fileId: string) => void;
  selectedFileId?: string;
}

export function FileList({ onFileSelect, selectedFileId }: FileListProps) {
  console.log('FileList: Rendering with selectedFileId:', selectedFileId);

  const { data, isLoading, error } = useQuery<File[]>({
    queryKey: ['files'],
    queryFn: async () => {
      console.log('FileList: Fetching files...');
      const response = await fetch('/api/files');
      if (!response.ok) {
        console.error('FileList: Failed to fetch files:', response.status, response.statusText);
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      console.log('FileList: Files fetched successfully:', data);
      return data || [];
    },
  });

  console.log('FileList: Current state:', { files: data, isLoading, error });

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading files...
      </div>
    );
  }

  if (error) {
    console.error('FileList: Error state:', error);
    return (
      <div className="p-4 text-center text-red-500">
        Error loading files. Please try again.
      </div>
    );
  }

  if (!data || data.length === 0) {
    console.log('FileList: No files available');
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No files uploaded yet. Upload a CSV file to get started.
      </div>
    );
  }

  console.log('FileList: Rendering file list with', data.length, 'files');
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select a file to chat with:
      </label>
      <select
        value={selectedFileId || ''}
        onChange={(e) => {
          console.log('FileList: File selected:', e.target.value);
          onFileSelect(e.target.value);
        }}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a file...</option>
        {Array.isArray(data) && data.map((file) => (
          <option key={file.id} value={file.id}>
            {file.name}
          </option>
        ))}
      </select>
    </div>
  );
} 