/**
 * Validation utilities for receipt data
 */

/**
 * Sanitize a numeric string by removing commas and other non-numeric characters
 * @param value - The string to sanitize
 * @returns Sanitized number or 0 if invalid
 */
export const sanitizeNumber = (value: string | number): number => {
    if (typeof value === 'number') {
        return isNaN(value) ? 0 : value;
    }

    if (typeof value === 'string') {
        // Remove commas, spaces, and other non-numeric characters except decimal point and minus sign
        const cleaned = value.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }

    return 0;
};

/**
 * Validate and sanitize receipt data before submission
 * @param data - Receipt data to validate
 * @returns Validation result with sanitized data or error message
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    sanitizedData?: any;
}

export const validateReceiptData = (data: {
    store_name?: string;
    date?: string;
    total?: string | number;
    items?: Array<{ name: string; quantity: string | number; price: string | number }>;
}): ValidationResult => {
    const errors: string[] = [];

    // Validate store name
    if (!data.store_name || data.store_name.trim() === '') {
        errors.push('Store name is required');
    }

    // Validate date format (basic check)
    if (data.date) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(data.date)) {
            errors.push('Date must be in YYYY-MM-DD format');
        }
    }

    // Sanitize and validate total
    const sanitizedTotal = sanitizeNumber(data.total || 0);
    if (sanitizedTotal < 0) {
        errors.push('Total amount cannot be negative');
    }

    // Sanitize and validate items
    const sanitizedItems = data.items?.map((item, index) => {
        const quantity = sanitizeNumber(item.quantity);
        const price = sanitizeNumber(item.price);

        if (!item.name || item.name.trim() === '') {
            errors.push(`Item ${index + 1}: Name is required`);
        }

        if (quantity <= 0) {
            errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }

        if (price < 0) {
            errors.push(`Item ${index + 1}: Price cannot be negative`);
        }

        return {
            name: item.name,
            quantity,
            price
        };
    }) || [];

    if (errors.length > 0) {
        return {
            isValid: false,
            errors
        };
    }

    return {
        isValid: true,
        errors: [],
        sanitizedData: {
            store_name: data.store_name,
            date: data.date,
            total: sanitizedTotal,
            items: sanitizedItems
        }
    };
};
