import React from 'react';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'alert' | 'success' | 'info';
  message: string;
  timestamp: Date;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    message: 'Blacklisted vehicle detected: XYZ789',
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'success',
    message: 'System performance optimized',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    type: 'info',
    message: 'Daily detection report generated',
    timestamp: new Date(Date.now() - 7200000),
  },
];

const NotificationsPanel: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Notifications
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
            {mockNotifications.length} New
          </span>
        </div>

        <div className="space-y-4">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start p-4 rounded-lg ${
                notification.type === 'alert'
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : notification.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex-shrink-0">
                {notification.type === 'alert' && (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                {notification.type === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
                {notification.type === 'info' && (
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-medium ${
                    notification.type === 'alert'
                      ? 'text-red-800 dark:text-red-200'
                      : notification.type === 'success'
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}
                >
                  {notification.message}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;