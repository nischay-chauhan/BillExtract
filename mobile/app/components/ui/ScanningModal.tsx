import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { rfs, spacing } from '../../utils/responsive';

interface ScanningModalProps {
    visible: boolean;
    status?: string;
}

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.8;

export const ScanningModal: React.FC<ScanningModalProps> = ({ visible, status = 'Analyzing Receipt...' }) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // Reset values
            translateY.value = 0;
            opacity.value = 0;

            // Start scanning animation
            translateY.value = withRepeat(
                withSequence(
                    withTiming(SCANNER_SIZE, { duration: 1500, easing: Easing.linear }),
                    withTiming(0, { duration: 1500, easing: Easing.linear })
                ),
                -1, // Infinite repeat
                true // Reverse
            );

            // Pulse opacity for the scanner line
            opacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 500 }),
                    withTiming(0.4, { duration: 500 })
                ),
                -1,
                true
            );
        }
    }, [visible]);

    const scannerLineStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value
        };
    });

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.container}>
                <View style={styles.overlay} />

                <Animated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                    style={styles.content}
                >
                    <View style={styles.scannerContainer}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />

                        <Ionicons name="receipt-outline" size={80} color="rgba(255,255,255,0.2)" />

                        <Animated.View style={[styles.scannerLine, scannerLineStyle]}>
                            <LinearGradient
                                colors={['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 1)', 'rgba(59, 130, 246, 0)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientLine}
                            />
                            <LinearGradient
                                colors={['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0)']}
                                style={styles.glowEffect}
                            />
                        </Animated.View>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.title}>AI Processing</Text>
                        <Text style={styles.subtitle}>{status}</Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    scannerContainer: {
        width: SCANNER_SIZE,
        height: SCANNER_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#3b82f6',
        borderWidth: 4,
        borderRadius: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderBottomWidth: 0,
        borderRightWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderTopWidth: 0,
        borderRightWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
    },
    scannerLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 40, // Height including glow
        justifyContent: 'center',
    },
    gradientLine: {
        height: 3,
        width: '100%',
    },
    glowEffect: {
        height: 40,
        width: '100%',
        position: 'absolute',
        top: -18, // Center the glow around the line
    },
    textContainer: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: rfs(24),
        fontWeight: 'bold',
        marginBottom: spacing.xs,
    },
    subtitle: {
        color: '#9ca3af',
        fontSize: rfs(16),
    }
});
