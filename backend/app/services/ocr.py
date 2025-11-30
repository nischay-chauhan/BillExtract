from paddleocr import PaddleOCR
import numpy as np
import cv2

ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)

def extract_text(image_bytes: bytes) -> str:
    """
    Extracts text from image bytes using PaddleOCR.
    Returns the joined raw text.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    result = ocr.ocr(image, cls=True)
    
    extracted_text = []
    if result and result[0]:
        for line in result[0]:
            # line structure: [[box_coords], [text, confidence]]
            text = line[1][0]
            extracted_text.append(text)
            
    return "\n".join(extracted_text)
