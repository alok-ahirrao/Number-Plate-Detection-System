import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface Detection {
  plate_number: string;
  confidence: number;
  timestamp: string;
  image_url?: string;
}

export const HistoryPanel = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDetections();
  }, []);

  const fetchDetections = async (query?: string) => {
    setLoading(true);
    setError('');

    try {
      const url = new URL('http://localhost:8000/api/detections');
      if (query) {
        url.searchParams.append('plate', query);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data = await response.json();
      setDetections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch detections');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDetections(searchQuery);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Detection History</h2>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plate number..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {detections.map((detection, index) => (
              <div key={index} className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {detection.plate_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      Confidence: {(detection.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(detection.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {detection.image_url && (
                    <img
                      src={detection.image_url}
                      alt={`License plate ${detection.plate_number}`}
                      className="w-24 h-auto rounded"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;