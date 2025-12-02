# Validation & Toast Notifications

## Overview
This document describes the validation system and toast notification implementation for the Bills mobile app.

## Features

### 1. Number Sanitization
The `sanitizeNumber` utility function automatically removes commas and other non-numeric characters from numeric inputs:

```typescript
import { sanitizeNumber } from '../utils/validation';

// Examples:
sanitizeNumber("1,234.56") // returns 1234.56
sanitizeNumber("$1,000") // returns 1000
sanitizeNumber("invalid") // returns 0
```

### 2. Receipt Data Validation
The `validateReceiptData` function validates and sanitizes all receipt data before submission:

- **Store Name**: Must be non-empty
- **Date**: Must be in YYYY-MM-DD format
- **Total**: Auto-sanitized, cannot be negative
- **Items**: Each item validated for:
  - Non-empty name
  - Quantity > 0
  - Price >= 0

### 3. Toast Notifications
Toast notifications provide user-friendly feedback for:
- **Validation errors**: Red toast showing specific validation issues
- **Save success**: Green toast confirming successful operations
- **Server errors**: Red toast showing server error messages

## Usage in ReviewReceiptScreen

The ReviewReceiptScreen now:
1. Validates all input data before submission
2. Sanitizes numeric values (removes commas)
3. Shows validation errors via toast
4. Shows server errors via toast with detailed messages
5. Shows success confirmation

## Usage in ReceiptDetailsScreen

The ReceiptDetailsScreen now:
- Uses `sanitizeNumber` for displaying totals and item prices
- Handles numeric values with commas correctly
- Displays formatted currency values consistently

## Chart Fixes for Mobile

### Analytics Screen Charts
Both pie and bar charts have been optimized for mobile:
- Responsive dimensions using `Math.min()` to cap maximum sizes
- Smaller font sizes on small devices
- Proper padding for better visibility
- Full width containers for proper rendering

## Testing
To test the validation:
1. Try entering values with commas (e.g., "1,234.56")
2. Try submitting with empty store name
3. Try invalid date formats
4. Try negative values
5. Observe toast notifications for each case

## Dependencies
- `react-native-toast-message`: Toast notification library
- Custom validation utilities in `/app/utils/validation.ts`
