/**
 * Formats a number into a compact string representation (e.g., 1.5k, 2.3m).
 * @param num The number to format.
 * @returns The formatted string.
 */
export const formatCompactNumber = (num: number): string => {
    if (num === undefined || num === null || isNaN(num)) return '₹0';

    const formatter = Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    });

    return '₹' + formatter.format(num);
};

/**
 * Formats a date string into a readable format (e.g., "Dec 1, 2023").
 * @param dateString The date string to format.
 * @returns The formatted date string.
 */
export const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No date';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (e) {
        return dateString;
    }
};
