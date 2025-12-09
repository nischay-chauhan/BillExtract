import React, { useEffect, useState, useCallback } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import {
    useSharedValue,
    withTiming,
    Easing,
    useAnimatedReaction,
    runOnJS,
} from 'react-native-reanimated';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimalPlaces?: number;
    style?: StyleProp<TextStyle>;
    className?: string;
    formatIndian?: boolean;
    compact?: boolean;
    /** Change this key to restart animation from 0 */
    resetKey?: number | string;
}

// Format number in Indian notation (lakh, crore)
const formatIndianNumber = (num: number, decimalPlaces: number = 2): string => {
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    });
};

// Format compact numbers (K, L for thousands, lakhs)
const formatCompact = (num: number): string => {
    if (num >= 10000000) {
        return `${(num / 10000000).toFixed(1)}Cr`;
    }
    if (num >= 100000) {
        return `${(num / 100000).toFixed(1)}L`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(2);
};

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
    value,
    duration = 800,
    prefix = '',
    suffix = '',
    decimalPlaces = 2,
    style,
    className = '',
    formatIndian = false,
    compact = false,
    resetKey,
}) => {
    const animatedValue = useSharedValue(0);
    const [displayValue, setDisplayValue] = useState('0');

    // JS thread callback for updating display value with formatting
    const updateDisplay = useCallback((currentValue: number) => {
        const formatted = compact
            ? formatCompact(currentValue)
            : formatIndian
                ? formatIndianNumber(currentValue, decimalPlaces)
                : currentValue.toFixed(decimalPlaces);

        setDisplayValue(formatted);
    }, [compact, formatIndian, decimalPlaces]);

    // Reset and animate when value or resetKey changes
    useEffect(() => {
        // Start from 0 and animate to target value
        animatedValue.value = 0;
        animatedValue.value = withTiming(value, {
            duration,
            easing: Easing.out(Easing.cubic),
        });
    }, [value, duration, resetKey]);

    // React to animated value changes - only pass the raw number to JS thread
    useAnimatedReaction(
        () => animatedValue.value,
        (currentValue) => {
            // Run formatting on JS thread, not UI thread
            runOnJS(updateDisplay)(currentValue);
        },
        [updateDisplay]
    );

    return (
        <Text style={style} className={className}>
            {prefix}{displayValue}{suffix}
        </Text>
    );
};

export default AnimatedNumber;

