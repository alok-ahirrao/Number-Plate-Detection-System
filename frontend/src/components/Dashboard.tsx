import React, { useState } from 'react';
import { Camera, History, Settings, Bell, Sun } from 'lucide-react';
import DetectionPanel from './DetectionPanel';
import HistoryPanel from './HistoryPanel';
import StatsPanel from './StatsPanel';
import NotificationsPanel from './NotificationsPanel';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('detection');

  return (
    <div className="min-h-screen dark bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              Number Plate Detection
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-700">
                <Sun className="w-5 h-5 text-gray-300" />
              </button>
              <button className="relative p-2 rounded-lg hover:bg-gray-700">
                <Bell className="w-5 h-5 text-gray-300" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 shadow-sm mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('detection')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'detection' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Camera className="w-5 h-5 inline-block mr-2" />
              Live Detection
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'history' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <History className="w-5 h-5 inline-block mr-2" />
              History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'settings' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Settings className="w-5 h-5 inline-block mr-2" />
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'detection' && <DetectionPanel />}
        {activeTab === 'history' && <HistoryPanel />}
        {activeTab === 'settings' && (
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
            {/* Add settings content */}
          </div>
        )}

        {/* Stats Panel */}
        <div className="mt-8">
          <StatsPanel />
        </div>

        {/* Notifications Panel */}
        <div className="mt-8">
          <NotificationsPanel />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
