import torch
import cv2
import numpy as np
import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from collections import Counter
from paddleocr import PaddleOCR
import base64
import io
from PIL import Image
import uvicorn
from concurrent.futures import ThreadPoolExecutor
import asyncio
from functools import lru_cache

# Fix path issue for Windows
import pathlib
if os.name == 'nt':
    pathlib.PosixPath = pathlib.WindowsPath

app = FastAPI()

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check if CUDA is available and set device
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Using device: {DEVICE}")

# Load YOLOv5 model for number plate detection with optimizations
yolo_model = torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt', force_reload=True, device=DEVICE)
yolo_model.conf = 0.5  # Confidence threshold
yolo_model.iou = 0.45  # NMS IoU threshold
yolo_model.agnostic = False  # NMS class-agnostic
yolo_model.multi_label = False  # NMS multiple labels per box
yolo_model.max_det = 1  # Maximum number of detections per image

# Initialize PaddleOCR with optimizations
ocr = PaddleOCR(use_angle_cls=True, lang="en", use_gpu=torch.cuda.is_available())

# Create thread pool for parallel processing
executor = ThreadPoolExecutor(max_workers=3)

def preprocess_image(image: np.ndarray) -> np.ndarray:
    """Optimize image for processing."""
    # Resize image to a reasonable size for faster processing
    max_dimension = 800
    height, width = image.shape[:2]
    if max(height, width) > max_dimension:
        scale = max_dimension / max(height, width)
        new_width = int(width * scale)
        new_height = int(height * scale)
        image = cv2.resize(image, (new_width, new_height))
    
    # Enhance contrast
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    enhanced = cv2.merge((cl,a,b))
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    
    return enhanced

def decode_base64_image(base64_string: str) -> np.ndarray:
    """Convert base64 image to a numpy array with optimization."""
    if "base64," in base64_string:
        base64_string = base64_string.split("base64,")[1]

    image_bytes = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_bytes))
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

def encode_image_to_base64(image: np.ndarray) -> str:
    """Convert numpy array image to base64 string with optimization."""
    success, encoded_image = cv2.imencode('.jpg', image, [cv2.IMWRITE_JPEG_QUALITY, 85])
    if success:
        return base64.b64encode(encoded_image.tobytes()).decode('utf-8')
    return ""

@lru_cache(maxsize=128)
def clean_text(text: str) -> str:
    """Clean and format license plate text with caching."""
    return ''.join(c for c in text if c.isalnum()).upper()

def process_single_frame(frame: np.ndarray) -> Dict:
    """Detects license plates and extracts text from a single frame with optimizations."""
    # Preprocess the image
    processed_frame = preprocess_image(frame)
    
    # Run detection on preprocessed image
    with torch.no_grad():  # Disable gradient calculation for inference
        results = yolo_model(processed_frame)
    
    detected_plates = []
    best_plate_image = None
    best_confidence = 0

    # Process detections
    for det in results.xyxy[0]:
        confidence = float(det[4])
        if confidence > 0.5:
            x1, y1, x2, y2 = map(int, det[:4])
            plate_region = processed_frame[y1:y2, x1:x2]
            
            # Skip small regions
            if plate_region.shape[0] < 20 or plate_region.shape[1] < 20:
                continue

            try:
                # OCR with optimized parameters
                ocr_result = ocr.ocr(plate_region, cls=True)
                if ocr_result:
                    for line in ocr_result:
                        for word_info in line:
                            text = word_info[1][0]
                            ocr_confidence = word_info[1][1]
                            
                            if ocr_confidence > 0.7:
                                cleaned_text = clean_text(text)
                                if 5 <= len(cleaned_text) <= 10:
                                    detected_plates.append(cleaned_text)
                                    if ocr_confidence > best_confidence:
                                        best_confidence = ocr_confidence
                                        best_plate_image = plate_region
            except Exception as e:
                print(f"OCR Error: {e}")
                continue

    return {
        "plates": detected_plates,
        "plate_image": best_plate_image
    }

async def process_frame_async(frame_data: dict) -> Dict:
    """Process a single frame asynchronously."""
    loop = asyncio.get_event_loop()
    frame = await loop.run_in_executor(executor, decode_base64_image, frame_data["data"])
    result = await loop.run_in_executor(executor, process_single_frame, frame)
    return result

@app.post("/detect_plate")
async def detect_plate(frames: List[dict]):
    """Process multiple frames concurrently and return the most frequently detected number plate."""
    all_detections = []
    best_plate_image = None
    best_confidence = 0

    # Process frames concurrently
    tasks = [process_frame_async(frame_data) for frame_data in frames]
    results = await asyncio.gather(*tasks)

    # Aggregate results
    for result in results:
        all_detections.extend(result["plates"])
        if result["plate_image"] is not None:
            if best_plate_image is None or best_confidence < 0.7:
                best_plate_image = result["plate_image"]
                best_confidence = 0.7

    if not all_detections:
        return {"error": "No license plates detected"}

    # Get most common plate number
    plate_counts = Counter(all_detections)
    most_common_plate, occurrences = plate_counts.most_common(1)[0]
    confidence_score = occurrences / len(frames)

    # Convert the best plate image to base64
    plate_image_base64 = None
    if best_plate_image is not None:
        plate_image_base64 = await asyncio.get_event_loop().run_in_executor(
            executor, encode_image_to_base64, best_plate_image
        )

    return {
        "plate_number": most_common_plate,
        "confidence": confidence_score,
        "total_frames_processed": len(frames),
        "total_detections": len(all_detections),
        "plate_image": plate_image_base64
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)