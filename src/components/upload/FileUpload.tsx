'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setUploading(false);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setUploading(false);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
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
            ? 'border-primary bg-primary/10'
            : 'border-primary/20 hover:border-primary'
        }
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="flex justify-center">
          <svg
            className={`w-12 h-12 ${
              isDragActive ? 'text-primary' : 'text-primary/50'
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
        <div className="text-primary/70">
          {uploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="spinner h-5 w-5" />
              <p>Uploading...</p>
            </div>
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
          <p className="text-error text-sm">
            Error uploading file. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}