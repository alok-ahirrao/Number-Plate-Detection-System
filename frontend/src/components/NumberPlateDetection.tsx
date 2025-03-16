import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';

interface DetectionResult {
  plate_number: string;
  confidence: number;
  total_frames_processed: number;
  total_detections: number;
  plate_image: string | null;
}

interface VideoDevice {
  deviceId: string;
  label: string;
}

const NumberPlateDetection: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [detectedPlate, setDetectedPlate] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<VideoDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  // Function to get available video devices
  const getVideoDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${devices.indexOf(device) + 1}`
        }));
      
      setDevices(videoDevices);
      
      // Set first device as default if none selected
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (err) {
      setError('Failed to get camera devices');
      console.error('Error getting video devices:', err);
    }
  }, [selectedDevice]);

  // Initialize video devices on component mount
  useEffect(() => {
    getVideoDevices();
  }, [getVideoDevices]);

  // Request camera permissions and refresh device list
  const handleRequestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      await getVideoDevices();
    } catch (err) {
      setError('Failed to get camera permissions');
      console.error('Error requesting permissions:', err);
    }
  };

  // Function to capture a single frame
  const captureFrame = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      return imageSrc;
    }
    return null;
  }, []);

  // Function to capture 3 frames with a short delay
  const startCapturing = useCallback(async () => {
    setIsCapturing(true);
    setError(null);
    const frames: string[] = [];
    const captureInterval = 300; // Capture every 300ms
    const numberOfFrames = 3; // Reduced to 3 frames

    for (let i = 0; i < numberOfFrames; i++) {
      const frame = captureFrame();
      if (frame) {
        frames.push(frame);
      }
      if (i < numberOfFrames - 1) { // Don't wait after the last frame
        await new Promise(resolve => setTimeout(resolve, captureInterval));
      }
    }

    try {
      const response = await fetch('http://localhost:8000/detect_plate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          frames.map(frame => ({
            data: frame
          }))
        ),
      });

      if (!response.ok) {
        throw new Error('Failed to process frames');
      }

      const result = await response.json();
      setDetectedPlate(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCapturing(false);
    }
  }, [captureFrame]);

  return (
    <div className="number-plate-detection">
      <div className="camera-selection">
        <div className="select-wrapper">
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="camera-select"
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
          <button 
            onClick={handleRequestPermissions}
            className="refresh-button"
            title="Refresh camera list"
          >
            <Camera size={20} />
          </button>
        </div>
      </div>

      <div className="webcam-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            deviceId: selectedDevice
          }}
          className="webcam"
        />
      </div>

      <div className="controls">
        <button 
          onClick={startCapturing}
          disabled={isCapturing}
          className="capture-button"
        >
          {isCapturing ? 'Capturing...' : 'Capture Plates'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {detectedPlate && (
        <div className="results">
          <h3>Detection Results</h3>
          <div className="result-grid">
            <div className="result-info">
              <p>Plate Number: <strong>{detectedPlate.plate_number}</strong></p>
              <p>Confidence: {(detectedPlate.confidence * 100).toFixed(2)}%</p>
              <p>Frames Processed: {detectedPlate.total_frames_processed}</p>
              <p>Total Detections: {detectedPlate.total_detections}</p>
            </div>
            {detectedPlate.plate_image && (
              <div className="plate-image-container">
                <h4>Detected Plate Image:</h4>
                <img 
                  src={`data:image/jpeg;base64,${detectedPlate.plate_image}`}
                  alt="Detected license plate"
                  className="plate-image"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberPlateDetection;