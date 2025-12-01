import React from 'react';
import { View, SafeAreaView, StatusBar, ViewProps, Platform } from 'react-native';
import { spacing, isSmallDevice } from '../../utils/responsive';

interface ScreenWrapperProps extends ViewProps {
    className?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, className = '', style, ...props }) => {
    const horizontalPadding = isSmallDevice ? spacing.sm : spacing.md;
    const topPadding = Platform.OS === 'android' ? spacing.xl + spacing.md : spacing.md;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
            <View
                className={`${className} flex-1`}
                style={[
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingTop: topPadding,
                    },
                    style
                ]}
                {...props}
            >
                {children}
            </View>
        </SafeAreaView>
    );
};
