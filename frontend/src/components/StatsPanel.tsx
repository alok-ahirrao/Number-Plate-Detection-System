import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StatsPanel: React.FC = () => {
  const data = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Detections',
        data: [12, 19, 35, 42, 38, 25],
        fill: false,
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Detections Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Detections</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-900 dark:text-blue-100">1,234</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Success Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-green-900 dark:text-green-100">95.8%</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg. Processing Time</h3>
          <p className="mt-2 text-3xl font-semibold text-purple-900 dark:text-purple-100">0.8s</p>
        </div>
      </div>
      <div className="h-80">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default StatsPanel;