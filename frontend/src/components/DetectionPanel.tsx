import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCcw } from 'lucide-react';

interface DetectionResult {
  plate_number: string;
  confidence: number;
  plate_image: string | null;
}

const DetectionPanel: React.FC = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const webcamRef = useRef<Webcam | null>(null);

  const handleDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting camera devices:', error);
    }
  }, [selectedDevice]);

  const captureFrames = useCallback(async () => {
    if (!webcamRef.current) return;
    
    setIsCapturing(true);
    const frames = [];
    const captureInterval = 300; // 300ms between frames
    const numberOfFrames = 3;

    for (let i = 0; i < numberOfFrames; i++) {
      const frame = webcamRef.current.getScreenshot();
      if (frame) {
        frames.push({ data: frame });
      }
      if (i < numberOfFrames - 1) {
        await new Promise(resolve => setTimeout(resolve, captureInterval));
      }
    }

    try {
      const response = await fetch('http://localhost:8000/detect_plate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(frames),
      });

      if (!response.ok) {
        throw new Error('Failed to process frames');
      }

      const result = await response.json();
      setDetectionResult(result);
    } catch (error) {
      console.error('Error detecting plate:', error);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Detection</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${devices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
            <button
              onClick={handleDevices}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Refresh camera list"
            >
              <RefreshCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Webcam Feed */}
          <div className="relative">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  deviceId: selectedDevice,
                  width: 1280,
                  height: 720
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={captureFrames}
              disabled={isCapturing}
              className={`mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isCapturing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              <Camera className="w-5 h-5 mr-2" />
              {isCapturing ? 'Capturing...' : 'Capture Plate'}
            </button>
          </div>

          {/* Detection Results */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detection Results</h3>
            {detectionResult ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plate Number</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {detectionResult.plate_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Confidence</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {(detectionResult.confidence * 100).toFixed(2)}%
                  </p>
                </div>
                {detectionResult.plate_image && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Plate Image</p>
                    <img
                      src={`data:image/jpeg;base64,${detectionResult.plate_image}`}
                      alt="Detected license plate"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No detection results yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionPanel;