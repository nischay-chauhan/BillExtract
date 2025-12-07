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
    // Disabled for now
    return {
        expoPushToken: null,
        notification: null,
        error: null,
        isRegistered: false,
        registerForPushNotifications: async () => null,
        unregister: async () => { },
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
