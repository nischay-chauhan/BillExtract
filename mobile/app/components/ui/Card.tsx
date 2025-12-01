import React from 'react';
import { View, ViewProps } from 'react-native';
import { spacing } from '../../utils/responsive';

interface CardProps extends ViewProps {
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, ...props }) => {
    // Check if padding is already specified in className or style
    const hasPadding = className.includes('p-') || className.includes('px-') || className.includes('py-');

    return (
        <View
            className={`${className} ${!className.includes('bg-') ? 'bg-white' : ''} rounded-2xl shadow-sm border ${!className.includes('border-') ? 'border-gray-100' : ''}`}
            style={[
                !hasPadding && { padding: spacing.md },
                style
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

