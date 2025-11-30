import google.generativeai as genai
from app.utils.config import settings
import json
import base64

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-2.0-flash-exp')

EXTRACTION_PROMPT = """
Extract all visible information from the receipt image.
If a field does not exist, return null.
Return JSON ONLY. No explanatory text.
Never hallucinate or invent details.
Use the universal schema strictly.

Use category classification from: grocery, restaurant, petrol, pharmacy, electronics, food_delivery, parking, toll, general

Return in this exact JSON format:
{
  "store_name": null,
  "address": null,
  "date": null,
  "category": null,
  "subtotal": null,
  "tax": null,
  "total": null,
  "payment_method": null,
  "items": [
    {
      "name": null,
      "qty": null,
      "price": null
    }
  ],
  "fuel_info": {
    "fuel_type": null,
    "quantity_liters": null,
    "rate_per_liter": null,
    "amount": null
  }
}

OCR Text (supporting information):
{ocr_text}

Extract the receipt data now.
"""

def extract_receipt_data(image_bytes: bytes, ocr_text: str) -> dict:
    """
    Extracts structured receipt data using Gemini 2.5 Flash multimodal.
    
    Args:
        image_bytes: The preprocessed image as bytes
        ocr_text: Raw OCR text extracted from the image
        
    Returns:
        dict: Parsed receipt data following the universal schema
    """
    try:
        prompt = EXTRACTION_PROMPT.format(ocr_text=ocr_text)
        
        image_parts = [
            {
                "mime_type": "image/jpeg",
                "data": base64.b64encode(image_bytes).decode('utf-8')
            }
        ]
        
        response = model.generate_content([prompt, image_parts[0]])
        
        response_text = response.text.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        response_text = response_text.strip()
        
        receipt_data = json.loads(response_text)
        
        return receipt_data
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response text: {response_text}")
        return {
            "store_name": None,
            "address": None,
            "date": None,
            "category": None,
            "subtotal": None,
            "tax": None,
            "total": None,
            "payment_method": None,
            "items": [],
            "fuel_info": None
        }
    except Exception as e:
        print(f"Gemini extraction error: {e}")
        return {
            "store_name": None,
            "address": None,
            "date": None,
            "category": None,
            "subtotal": None,
            "tax": None,
            "total": None,
            "payment_method": None,
            "items": [],
            "fuel_info": None
        }
