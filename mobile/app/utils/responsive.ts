import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro as reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Cap the width for scaling calculations to avoid huge elements on desktop/web
// We'll use a max width similar to a large phone or small tablet
const MAX_SCALABLE_WIDTH = 480;
const EFFECTIVE_WIDTH = Math.min(SCREEN_WIDTH, MAX_SCALABLE_WIDTH);

/**
 * Convert a base width to a responsive width
 * @param size - The size in pixels based on 375px wide screen
 * @returns Responsive width
 */
export const wp = (size: number): number => {
    const percentage = (size / BASE_WIDTH) * 100;
    // Use EFFECTIVE_WIDTH instead of SCREEN_WIDTH to cap scaling
    const elemWidth = (percentage * EFFECTIVE_WIDTH) / 100;
    return Math.round(PixelRatio.roundToNearestPixel(elemWidth));
};

/**
 * Convert a base height to a responsive height
 * @param size - The size in pixels based on 812px tall screen
 * @returns Responsive height
 */
export const hp = (size: number): number => {
    const percentage = (size / BASE_HEIGHT) * 100;
    const elemHeight = (percentage * SCREEN_HEIGHT) / 100;
    return Math.round(PixelRatio.roundToNearestPixel(elemHeight));
};

/**
 * Responsive font size
 * @param size - Base font size
 * @returns Scaled font size
 */
export const rfs = (size: number): number => {
    // Use EFFECTIVE_WIDTH to calculate scale
    const scale = EFFECTIVE_WIDTH / BASE_WIDTH;
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Get responsive padding/margin values
 */
export const spacing = {
    xs: wp(4),
    sm: wp(8),
    md: wp(16),
    lg: wp(24),
    xl: wp(32),
    xxl: wp(40),
};

/**
 * Check if device is small (width < 375)
 */
export const isSmallDevice = SCREEN_WIDTH < 375;

/**
 * Check if device is large (width > 414)
 */
export const isLargeDevice = SCREEN_WIDTH > 414;

/**
 * Get screen dimensions
 */
export const getScreenDimensions = () => ({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
});
