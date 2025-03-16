# Number Plate Detection System

## Project Overview
This project is a full-stack application for automatic number plate detection and recognition using a YOLOv5 model for number plate detection and PaddleOCR for text recognition. It consists of a Python-based backend and a React frontend.

## Project Structure

```
project-root/
├── backend/
│   ├── model/
│   │   └── best.pt
│   ├── main.py
│   └── requirements.txt
└── frontend/
    ├── node_modules/
    ├── src/
    │   ├── components/
    │   ├── Dashboard.tsx
    │   ├── DetectionPanel.tsx
    │   ├── HistoryPanel.tsx
    │   ├── NotificationsPanel.tsx
    │   ├── NumberPlateDetection.tsx
    │   └── StatsPanel.tsx
    ├── styles/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── vite-env.d.ts
    ├── other*
```

## Backend
The backend consists of:
- **Framework:** FastAPI
- **Detection Model:** YOLOv5 (Custom Trained Model: `best.pt`)
- **OCR Engine:** PaddleOCR

### Backend setup
1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Run Backend
```bash
python main.py
```
The backend API will be accessible at `http://localhost:8000`.

## Frontend
The frontend is built using:
- **Framework:** React
- **Build Tool:** Vite

### Components:
- **Dashboard:** Main interface.
- **DetectionPanel:** Number plate detection interface.
- **HistoryPanel:** View historical detections.
- **NotificationsPanel:** Notifications system.
- **NumberPlateDetection:** Handles frontend logic for plate detection interaction.
- **StatsPanel:** Displays statistics related to detection.

Run the frontend application using:
```shell
cd frontend
npm install
npm run dev
```

## Setup

### Backend Setup:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

## API Endpoint

The primary endpoint for detecting number plates is:

- **POST** `/detect_plate`: Accepts images in base64 format, returns detected number plates and associated confidence.

## Technologies Used

- FastAPI
- PyTorch
- YOLOv5
- PaddleOCR
- OpenCV
- React
- Vite

## Running the Project

After setting up the backend and frontend:
- The backend will be accessible at: `http://localhost:8000`
- The frontend development server typically runs at: `http://localhost:5173`

Ensure the backend server is running to provide the necessary API endpoints to the frontend.

## Contributing

Feel free to contribute by creating feature branches and submitting pull requests for review.
---

## **License**

Copyright (c) 2025, Alok Ahirrao

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
You may use and modify this project for personal or educational purposes, but commercial use is prohibited without explicit permission.

For more details, see the LICENSE file or contact alokahirrao.ai@gmail.com .
---


**Happy Developing! 🚀** 