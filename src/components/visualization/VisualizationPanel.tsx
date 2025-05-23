'use client';

import { useQuery } from '@tanstack/react-query';
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

// Default empty data to prevent errors
const defaultData: VisualizationData = {
  labels: [],
  datasets: [{
    label: 'No data',
    data: [],
    backgroundColor: 'rgba(54, 162, 235, 0.5)',
  }]
};

export function VisualizationPanel({ selectedFileId }: VisualizationPanelProps) {
  const { data, isLoading, error } = useQuery<VisualizationData>({
    queryKey: ['visualization', selectedFileId],
    queryFn: async () => {
      if (!selectedFileId) return defaultData;
      const response = await fetch(`/api/visualization?fileId=${selectedFileId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch visualization data');
      }
      const responseData = await response.json();
      
      // Ensure the data is in the correct format
      if (!responseData || !responseData.labels || !responseData.datasets) {
        console.error('Invalid visualization data format:', responseData);
        return defaultData;
      }
      
      return responseData;
    },
    enabled: !!selectedFileId,
  });

  const visualizationData = data || defaultData;

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

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading visualization. Please try again.
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