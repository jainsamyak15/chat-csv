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
  const { data, isLoading, error } = useQuery<File[]>({
    queryKey: ['files'],
    queryFn: async () => {
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center text-primary/50">
        <div className="spinner mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-error">
        Error loading files. Please try again.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-primary/50">
        No files uploaded yet. Upload a CSV file to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-primary/70">
        Select a file to chat with:
      </label>
      <select
        value={selectedFileId || ''}
        onChange={(e) => onFileSelect(e.target.value)}
        className="input w-full"
      >
        <option value="">Select a file...</option>
        {data.map((file) => (
          <option key={file.id} value={file.id}>
            {file.name}
          </option>
        ))}
      </select>
    </div>
  );
}