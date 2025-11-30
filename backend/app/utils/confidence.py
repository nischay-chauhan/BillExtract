def calculate_confidence(receipt_data: dict, raw_ocr_text: str) -> tuple[float, str]:
    """
    Calculates confidence score for extracted receipt data.
    
    Scoring rules:
    +20 if store_name exists
    +20 if total exists
    +40 if at least one item OR fuel_info is populated
    +10 if OCR text > 30 characters
    +10 if date extracted
    
    Args:
        receipt_data: The extracted receipt data dictionary
        raw_ocr_text: The raw OCR text
        
    Returns:
        tuple: (confidence_score, status)
        status can be: "high" (70-100), "medium" (40-69), "low" (0-39)
    """
    score = 0.0
    
    if receipt_data.get("store_name"):
        score += 20
        
    if receipt_data.get("total"):
        score += 20
        
    items = receipt_data.get("items", [])
    fuel_info = receipt_data.get("fuel_info")
    
    has_items = len(items) > 0 and any(item.get("name") for item in items)
    has_fuel = fuel_info and (fuel_info.get("fuel_type") or fuel_info.get("quantity_liters"))
    
    if has_items or has_fuel:
        score += 40
        
    if len(raw_ocr_text) > 30:
        score += 10
        
    if receipt_data.get("date"):
        score += 10
        
    if score >= 70:
        status = "high"
    elif score >= 40:
        status = "medium"
    else:
        status = "low"
        
    return score, status
