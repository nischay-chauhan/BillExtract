import { Platform } from 'react-native';
import api from './api';
import { useAuthStore } from '../store/authStore';

// Simple in-memory cache
let receiptsCache: {
    data: ReceiptData[];
    timestamp: number;
    params: string;
} | null = null;

export const invalidateReceiptsCache = () => {
    console.log('[Receipts API] Invalidating cache');
    receiptsCache = null;
    spendingCache = null;
};

// Simple in-memory cache for spending
let spendingCache: {
    data: CategorySpending[];
    timestamp: number;
    params: string;
} | null = null;

export const getCachedReceipts = (): ReceiptData[] | null => {
    return receiptsCache?.data || null;
};

export const getCachedSpending = (startDate?: string, endDate?: string): CategorySpending[] | null => {
    const key = JSON.stringify({ startDate, endDate });
    if (spendingCache && spendingCache.params === key) {
        return spendingCache.data;
    }
    return null;
};


export interface ReceiptData {
    _id?: string;
    id?: string;
    store_name: string;
    date: string;
    total: number | string;
    items: ReceiptItem[];
    payment_method?: string;
    category?: string;
}

export interface ReceiptItem {
    name: string;
    quantity: number;
    price: number | string;
}

export interface ReceiptData {
    _id?: string;
    id?: string;
    store_name: string;
    date: string;
    total: number | string;
    items: ReceiptItem[];
    payment_method?: string;
    category?: string;
}

export interface UploadReceiptResponse {
    extracted: ReceiptData;
    confidence: number;
    status: string;
    receipt_id: string;
}

export interface UpdateReceiptPayload {
    store_name?: string;
    date?: string;
    total?: number;
    items?: ReceiptItem[];
    payment_method?: string;
    category?: string;
}

interface GetReceiptsResponse {
    page: number;
    limit: number;
    receipts: ReceiptData[];
    count: number;
}

/**
 * Upload receipt image to backend for processing
 * @param imageUri - Local URI of the image file
 * @returns Extracted receipt data with confidence score
 */

export const uploadReceipt = async (imageUri: string): Promise<UploadReceiptResponse> => {
    try {
        // Create FormData
        const formData = new FormData();

        // Extract filename from URI
        const filename = imageUri.split('/').pop() || 'receipt.jpg';

        // Append image file to FormData
        if (Platform.OS === 'web') {
            // For Web: Fetch the URI to get a Blob
            console.log('[Receipts API] Fetching image from URI:', imageUri);
            const response = await fetch(imageUri);
            const blob = await response.blob();
            console.log('[Receipts API] Blob created:', {
                size: blob.size,
                type: blob.type,
                uri: imageUri
            });
            formData.append('file', blob, filename);
        } else {
            // For Native (iOS/Android): Use the object format
            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: 'image/jpeg',
            } as any);
        }

        console.log('[Receipts API] Uploading receipt:', filename);

        // Get token from store
        const token = useAuthStore.getState().token;

        // Use native fetch instead of axios for FormData reliability on Web
        const response = await fetch(`${api.defaults.baseURL}/receipts/upload_receipt`, {
            method: 'POST',
            body: formData,
            headers: {
                // Let the browser set the Content-Type header with the boundary
                // 'Content-Type': 'multipart/form-data',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('[Receipts API] Upload successful:', data);
        invalidateReceiptsCache(); // Invalidate cache on new upload
        return data;
    } catch (error: any) {
        console.error('[Receipts API] Upload failed:', error);
        throw new Error(
            error.message || 'Failed to upload receipt'
        );
    }
};

/**
 * Update receipt data
 * @param receiptId - Receipt ID from backend
 * @param data - Updated receipt data
 * @returns Updated receipt
 */
export const updateReceipt = async (
    receiptId: string,
    data: UpdateReceiptPayload
): Promise<ReceiptData> => {
    try {
        console.log('[Receipts API] Updating receipt:', receiptId);

        const response = await api.put<ReceiptData>(
            `/receipts/receipt/${receiptId}`,
            data
        );

        console.log('[Receipts API] Update successful');
        invalidateReceiptsCache(); // Invalidate cache on update
        return response.data;
    } catch (error: any) {
        console.error('[Receipts API] Update failed:', error);

        // Extract detailed error message
        let errorMessage = 'Failed to update receipt';

        if (error.response?.data) {
            // Handle different server response formats
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.detail) {
                if (typeof error.response.data.detail === 'string') {
                    errorMessage = error.response.data.detail;
                } else if (Array.isArray(error.response.data.detail)) {
                    // Handle validation errors from FastAPI
                    errorMessage = error.response.data.detail.map((err: any) =>
                        `${err.loc?.join('.')} - ${err.msg}`
                    ).join(', ');
                }
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Get receipt by ID
 * @param receiptId - Receipt ID
 * @returns Receipt data
 */
export const getReceiptById = async (receiptId: string): Promise<ReceiptData> => {
    try {
        const response = await api.get<ReceiptData>(`/receipts/receipt/${receiptId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.detail ||
            error.message ||
            'Failed to fetch receipt'
        );
    }
};

/**
 * Get all receipts
 * @returns List of receipts
 */
export const getReceipts = async (page: number = 1, limit: number = 10): Promise<ReceiptData[]> => {
    try {
        const cacheKey = JSON.stringify({ page, limit });

        // Return cached data if available and valid (e.g., < 5 mins or until invalidated)
        if (receiptsCache && receiptsCache.params === cacheKey) {
            console.log('[Receipts API] Returning cached receipts');
            return receiptsCache.data;
        }

        const response = await api.get<GetReceiptsResponse>('/receipts/receipts', {
            params: { page, limit }
        });

        const data = response.data.receipts || [];

        // Update cache
        receiptsCache = {
            data,
            timestamp: Date.now(),
            params: cacheKey
        };

        return data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.detail ||
            error.message ||
            'Failed to fetch receipts'
        );
    }
};


/**
 * Update receipt category
 * @param receiptId - Receipt ID
 * @param category - New category value
 * @returns Updated receipt
 */
export const updateReceiptCategory = async (
    receiptId: string,
    category: string
): Promise<ReceiptData> => {
    try {
        console.log('[Receipts API] Updating receipt category:', receiptId, category);

        const response = await api.patch<ReceiptData>(
            `/receipts/receipt/${receiptId}/category`,
            null,
            {
                params: { category }
            }
        );

        console.log('[Receipts API] Category update successful');
        invalidateReceiptsCache(); // Invalidate cache on category update
        return response.data;
    } catch (error: any) {
        console.error('[Receipts API] Category update failed:', error);
        throw new Error(
            error.response?.data?.detail ||
            error.message ||
            'Failed to update category'
        );
    }
};

/**
 * Get spending by category with optional date range
 * @param startDate - Optional start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 * @returns List of category spending data
 */
export interface CategorySpending {
    category: string;
    total: number;
    count: number;
}

export const getSpendingByCategory = async (
    startDate?: string,
    endDate?: string
): Promise<CategorySpending[]> => {
    try {
        console.log('[Receipts API] Fetching spending by category');

        const cacheKey = JSON.stringify({
            startDate: startDate || null,
            endDate: endDate || null
        });

        if (spendingCache && spendingCache.params === cacheKey) {
            console.log('[Receipts API] Returning cached spending data');
            return spendingCache.data;
        }

        const response = await api.get<{ data: CategorySpending[] }>(
            '/analytics/spending_by_category',
            {
                params: {
                    ...(startDate && { start_date: startDate }),
                    ...(endDate && { end_date: endDate })
                }
            }
        );

        const data = response.data.data || [];

        spendingCache = {
            data,
            timestamp: Date.now(),
            params: cacheKey
        };

        console.log('[Receipts API] Spending data retrieved:', data);
        return data;
    } catch (error: any) {
        console.error('[Receipts API] Failed to fetch spending data:', error);
        throw new Error(
            error.response?.data?.detail ||
            error.message ||
            'Failed to fetch spending data'
        );
    }
};

/**
 * Delete a receipt by ID
 * @param receiptId - Receipt ID to delete
 * @returns Success message
 */
export const deleteReceipt = async (receiptId: string): Promise<{ message: string; id: string }> => {
    try {
        console.log('[Receipts API] Deleting receipt:', receiptId);

        const response = await api.delete<{ message: string; id: string }>(
            `/receipts/receipt/${receiptId}`
        );

        console.log('[Receipts API] Delete successful');
        invalidateReceiptsCache(); // Invalidate cache on delete
        return response.data;
    } catch (error: any) {
        console.error('[Receipts API] Delete failed:', error);

        let errorMessage = 'Failed to delete receipt';
        if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

