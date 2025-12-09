import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeIn,
    FadeInLeft,
    FadeInRight,
} from 'react-native-reanimated';

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInViewProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    direction?: AnimationDirection;
    style?: StyleProp<ViewStyle>;
    className?: string;
}

const getEnteringAnimation = (
    direction: AnimationDirection,
    duration: number,
    delay: number
) => {
    const baseConfig = { duration };

    switch (direction) {
        case 'up':
            return FadeInUp.duration(duration).delay(delay).springify().damping(15);
        case 'down':
            return FadeInDown.duration(duration).delay(delay).springify().damping(15);
        case 'left':
            return FadeInLeft.duration(duration).delay(delay).springify().damping(15);
        case 'right':
            return FadeInRight.duration(duration).delay(delay).springify().damping(15);
        case 'none':
        default:
            return FadeIn.duration(duration).delay(delay);
    }
};

export const FadeInView: React.FC<FadeInViewProps> = ({
    children,
    delay = 0,
    duration = 400,
    direction = 'down',
    style,
    className = '',
}) => {
    return (
        <Animated.View
            entering={getEnteringAnimation(direction, duration, delay)}
            style={style}
            className={className}
        >
            {children}
        </Animated.View>
    );
};

// Convenience components for common use cases
export const FadeInFromBottom: React.FC<Omit<FadeInViewProps, 'direction'>> = (props) => (
    <FadeInView {...props} direction="up" />
);

export const FadeInFromTop: React.FC<Omit<FadeInViewProps, 'direction'>> = (props) => (
    <FadeInView {...props} direction="down" />
);

export default FadeInView;
