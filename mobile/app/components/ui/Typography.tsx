import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
    className?: string;
}

export const Title: React.FC<TypographyProps> = ({ children, className = '', ...props }) => (
    <Text className={`${className} text-3xl font-bold ${!className.includes('text-') ? 'text-gray-900' : ''} ${!className.includes('mb-') ? 'mb-2' : ''}`} {...props}>
        {children}
    </Text>
);

export const Subtitle: React.FC<TypographyProps> = ({ children, className = '', ...props }) => (
    <Text className={`${className} text-xl font-semibold ${!className.includes('text-') ? 'text-gray-800' : ''} ${!className.includes('mb-') ? 'mb-1' : ''}`} {...props}>
        {children}
    </Text>
);

export const Body: React.FC<TypographyProps> = ({ children, className = '', ...props }) => (
    <Text className={`${className} text-base ${!className.includes('text-') ? 'text-gray-600' : ''}`} {...props}>
        {children}
    </Text>
);

export const Caption: React.FC<TypographyProps> = ({ children, className = '', ...props }) => (
    <Text className={`${className} text-sm ${!className.includes('text-') ? 'text-gray-500' : ''}`} {...props}>
        {children}
    </Text>
);
