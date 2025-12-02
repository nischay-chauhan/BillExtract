import google.generativeai as genai
from app.utils.config import settings
import json
import base64

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-2.5-flash')

EXTRACTION_PROMPT = """
Extract all visible information from the receipt image.
Return JSON ONLY. No explanatory text.
Format:
{
  "store_name": null,
  "date": "YYYY-MM-DD",
  "total": null,
  "category": null,
  "items": [
    { "name": null, "quantity": null, "price": null }
  ]
}

For "date", strictly use YYYY-MM-DD format (e.g., 2023-12-25). If the year is missing, assume the current year.

For "category", choose the best fit from this list based on the store name and items:
- grocery
- restaurant
- petrol
- pharmacy
- electronics
- food_delivery
- parking
- toll
- general

If unsure, use "general".
"""

def extract_receipt_data(image_bytes: bytes) -> dict:
    """
    Extracts structured receipt data using Gemini 2.5 Flash.
    
    Args:
        image_bytes: The image as bytes
        
    Returns:
        dict: Parsed receipt data
    """
    try:
        image_parts = [
            {
                "mime_type": "image/jpeg",
                "data": base64.b64encode(image_bytes).decode('utf-8')
            }
        ]
        
        response = model.generate_content([EXTRACTION_PROMPT, image_parts[0]])
        
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
        
    except Exception as e:
        print(f"Gemini extraction error: {e}")
        return {
            "store_name": None,
            "date": None,
            "total": None,
            "items": []
        }
