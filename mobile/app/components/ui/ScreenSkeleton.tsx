import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { ScreenWrapper } from './ScreenWrapper';

export const ScreenSkeleton = () => {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 600, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 600, easing: Easing.inOut(Easing.quad) })
            ),
            -1, // Infinite repeat
            true // Reverse
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Animated.View style={[styles.iconContainer, animatedStyle]}>
                    <Ionicons name="analytics" size={64} color="#6366f1" />
                </Animated.View>
                <Text style={styles.text}>Loading...</Text>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb', 
    },
    iconContainer: {
        marginBottom: 20,
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    text: {
        fontSize: 18,
        color: '#4b5563', // gray-600
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
