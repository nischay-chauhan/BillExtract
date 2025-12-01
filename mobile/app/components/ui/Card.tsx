import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, ...props }) => {
    return (
        <View
            className={`${className} ${!className.includes('bg-') ? 'bg-white' : ''} rounded-2xl p-4 shadow-sm border ${!className.includes('border-') ? 'border-gray-100' : ''}`}
            style={style}
            {...props}
        >
            {children}
        </View>
    );
};
