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

const defaultData: VisualizationData = {
  labels: [],
  datasets: [{
    label: 'No data',
    data: [],
    backgroundColor: 'rgba(0, 255, 0, 0.5)',
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
      return response.json();
    },
    enabled: !!selectedFileId,
  });

  const visualizationData = data || defaultData;

  if (!selectedFileId) {
    return (
      <div className="p-4 text-center text-primary/50">
        Select a file to view its visualization
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-error">
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
              labels: {
                color: '#00ff00',
              },
            },
            title: {
              display: true,
              text: 'Data Visualization',
              color: '#00ff00',
            },
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(0, 255, 0, 0.1)',
              },
              ticks: {
                color: '#00ff00',
              },
            },
            y: {
              grid: {
                color: 'rgba(0, 255, 0, 0.1)',
              },
              ticks: {
                color: '#00ff00',
              },
            },
          },
        }}
      />
    </div>
  );
}