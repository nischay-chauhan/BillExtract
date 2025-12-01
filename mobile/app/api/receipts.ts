import { Platform } from 'react-native';
import api from './api';


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

        // Use native fetch instead of axios for FormData reliability on Web
        const response = await fetch(`${api.defaults.baseURL}/receipts/upload_receipt`, {
            method: 'POST',
            body: formData,
            headers: {
                // Let the browser set the Content-Type header with the boundary
                // 'Content-Type': 'multipart/form-data', 
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('[Receipts API] Upload successful:', data);
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
        return response.data;
    } catch (error: any) {
        console.error('[Receipts API] Update failed:', error);
        throw new Error(
            error.response?.data?.detail ||
            error.message ||
            'Failed to update receipt'
        );
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
export const getReceipts = async (): Promise<ReceiptData[]> => {
    try {
        const response = await api.get<GetReceiptsResponse>('/receipts/receipts');
        // Extract the receipts array from the paginated response
        return response.data.receipts || [];
    } catch (error: any) {
        throw new Error(
            error.response?.data?.detail ||
            error.message ||
            'Failed to fetch receipts'
        );
    }
};

