export interface User {
    _id: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
}

// Receipt Categories
export const CATEGORIES = [
    'grocery',
    'restaurant',
    'petrol',
    'pharmacy',
    'electronics',
    'food_delivery',
    'parking',
    'toll',
    'general'
] as const;

export type Category = typeof CATEGORIES[number];

// Analytics Types
export interface CategorySpending {
    category: string;
    total: number;
    count: number;
}
