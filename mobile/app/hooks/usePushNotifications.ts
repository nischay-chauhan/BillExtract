/**
 * Push Notifications Hook
 * 
 * Handles Expo push notification setup, permissions, and event handling.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { registerPushToken, unregisterPushToken } from '../api/notifications';
import { useAuthStore } from '../store/authStore';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface PushNotificationState {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    error: string | null;
    isRegistered: boolean;
}

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    const { token: authToken, isAuthenticated } = useAuthStore();

    /**
     * Register for push notifications
     */
    const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
        // Push notifications only work on physical devices
        if (!Device.isDevice) {
            console.log('[Push] Must use physical device for Push Notifications');
            setError('Push notifications require a physical device');
            return null;
        }

        try {
            // Check existing permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permissions if not granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('[Push] Permission not granted');
                setError('Permission not granted for push notifications');
                return null;
            }

            // Get push token
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;

            if (!projectId) {
                console.error('[Push] No projectId found in app config');
                setError('Push notification configuration error');
                return null;
            }

            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId,
            });

            const token = tokenData.data;
            console.log('[Push] Got Expo push token:', token);
            setExpoPushToken(token);

            // Configure Android notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#6366f1',
                });
            }

            return token;
        } catch (err) {
            console.error('[Push] Error registering:', err);
            setError('Failed to register for push notifications');
            return null;
        }
    }, []);

    /**
     * Register token with backend
     */
    const registerTokenWithBackend = useCallback(async (token: string) => {
        if (!isAuthenticated) {
            console.log('[Push] Not authenticated, skipping backend registration');
            return;
        }

        try {
            await registerPushToken(token);
            setIsRegistered(true);
            console.log('[Push] Token registered with backend');
        } catch (err) {
            console.error('[Push] Failed to register token with backend:', err);
            setError('Failed to sync push token with server');
        }
    }, [isAuthenticated]);

    /**
     * Unregister push notifications
     */
    const unregister = useCallback(async () => {
        if (expoPushToken && isAuthenticated) {
            try {
                await unregisterPushToken(expoPushToken);
                setIsRegistered(false);
                console.log('[Push] Token unregistered from backend');
            } catch (err) {
                console.error('[Push] Failed to unregister token:', err);
            }
        }
    }, [expoPushToken, isAuthenticated]);

    // Initialize push notifications
    useEffect(() => {
        let isMounted = true;

        const initPush = async () => {
            const token = await registerForPushNotifications();
            if (token && isMounted && isAuthenticated) {
                await registerTokenWithBackend(token);
            }
        };

        if (isAuthenticated) {
            initPush();
        }

        // Set up notification listeners
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('[Push] Notification received:', notification);
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('[Push] Notification tapped:', response);
            // Handle notification tap - navigate based on data
            const data = response.notification.request.content.data;
            handleNotificationTap(data);
        });

        return () => {
            isMounted = false;
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [isAuthenticated, registerForPushNotifications, registerTokenWithBackend]);

    /**
     * Handle notification tap
     */
    const handleNotificationTap = (data: any) => {
        console.log('[Push] Handling notification tap with data:', data);
        // TODO: Add navigation logic based on notification type
        // e.g., if (data.type === 'receipt_processed') navigate to receipt details
    };

    return {
        expoPushToken,
        notification,
        error,
        isRegistered,
        registerForPushNotifications,
        unregister,
    };
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    seconds: number = 1
) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false },
    });
}
