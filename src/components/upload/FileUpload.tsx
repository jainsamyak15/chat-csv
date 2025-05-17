'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      console.log('FileUpload: Starting upload for file:', file.name);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('FileUpload: Upload failed:', response.status, response.statusText);
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('FileUpload: Upload successful:', data);
      return data;
    },
    onSuccess: () => {
      console.log('FileUpload: Invalidating files query');
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setUploading(false);
    },
    onError: (error) => {
      console.error('FileUpload: Upload error:', error);
      setUploading(false);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      console.log('FileUpload: File dropped:', acceptedFiles[0].name);
      setUploading(true);
      await uploadFile.mutateAsync(acceptedFiles[0]);
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'
        }
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="flex justify-center">
          <svg
            className={`w-12 h-12 ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <div className="text-gray-600 dark:text-gray-300">
          {uploading ? (
            <p>Uploading...</p>
          ) : isDragActive ? (
            <p>Drop your CSV file here</p>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">Drag and drop your CSV file here</p>
              <p className="text-sm">or click to browse</p>
            </div>
          )}
        </div>
        {uploadFile.isError && (
          <p className="text-red-500 text-sm">
            Error uploading file. Please try again.
          </p>
        )}
      </div>
    </div>
  );
} 