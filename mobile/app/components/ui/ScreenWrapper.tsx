import React from 'react';
import { View, SafeAreaView, StatusBar, ViewProps, Platform } from 'react-native';

interface ScreenWrapperProps extends ViewProps {
    className?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, className = '', style, ...props }) => {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
            <View
                className={`${className} flex-1 px-4 pt-2`}
                style={[{ paddingTop: Platform.OS === 'android' ? 40 : 0 }, style]}
                {...props}
            >
                {children}
            </View>
        </SafeAreaView>
    );
};
