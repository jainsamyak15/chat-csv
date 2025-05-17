'use client';

import { useQuery } from '@tanstack/react-query';
import { File } from '@prisma/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface VisualizationPanelProps {
  selectedFileId?: string;
}

interface VisualizationData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export function VisualizationPanel({ selectedFileId }: VisualizationPanelProps) {
  const { data: visualizationData, isLoading } = useQuery<VisualizationData>({
    queryKey: ['visualization', selectedFileId],
    queryFn: async () => {
      if (!selectedFileId) return null;
      const response = await fetch(`/api/visualization?fileId=${selectedFileId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch visualization data');
      }
      return response.json();
    },
    enabled: !!selectedFileId,
  });

  if (!selectedFileId) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Select a file to view its visualization
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!visualizationData) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No visualization data available for this file
      </div>
    );
  }

  return (
    <div className="h-[600px]">
      <Bar
        data={visualizationData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: 'Data Visualization',
            },
          },
        }}
      />
    </div>
  );
} 