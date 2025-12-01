import React from 'react';
import { Text, TextProps } from 'react-native';
import { rfs } from '../../utils/responsive';

interface TypographyProps extends TextProps {
    className?: string;
}

export const Title: React.FC<TypographyProps> = ({ children, className = '', style, ...props }) => (
    <Text
        className={`${className} ${!className.includes('text-') ? 'text-gray-900' : ''} ${!className.includes('mb-') ? 'mb-2' : ''}`}
        style={[{ fontFamily: 'Inter_700Bold', fontSize: rfs(28) }, style]}
        {...props}
    >
        {children}
    </Text>
);

export const Subtitle: React.FC<TypographyProps> = ({ children, className = '', style, ...props }) => (
    <Text
        className={`${className} ${!className.includes('text-') ? 'text-gray-800' : ''} ${!className.includes('mb-') ? 'mb-1' : ''}`}
        style={[{ fontFamily: 'Inter_600SemiBold', fontSize: rfs(18) }, style]}
        {...props}
    >
        {children}
    </Text>
);

export const Body: React.FC<TypographyProps> = ({ children, className = '', style, ...props }) => (
    <Text
        className={`${className} ${!className.includes('text-') ? 'text-gray-600' : ''}`}
        style={[{ fontFamily: 'Inter_400Regular', fontSize: rfs(14) }, style]}
        {...props}
    >
        {children}
    </Text>
);

export const Caption: React.FC<TypographyProps> = ({ children, className = '', style, ...props }) => (
    <Text
        className={`${className} ${!className.includes('text-') ? 'text-gray-500' : ''}`}
        style={[{ fontFamily: 'Inter_400Regular', fontSize: rfs(12) }, style]}
        {...props}
    >
        {children}
    </Text>
);
