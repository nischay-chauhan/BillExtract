import api from './api';

export interface Notification {
    id: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    sent_at: string;
    read: boolean;
}


export const registerPushToken = async (token: string, platform: 'expo' | 'ios' | 'android' = 'expo'): Promise<void> => {
    await api.post('/notifications/register-token', {
        token,
        platform,
    });
};

export const unregisterPushToken = async (token: string): Promise<void> => {
    await api.delete('/notifications/unregister-token', {
        params: { token },
    });
};


export const getNotifications = async (limit: number = 50): Promise<Notification[]> => {
    const response = await api.get('/notifications/', {
        params: { limit },
    });
    return response.data;
};


export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
};

export const sendTestNotification = async (): Promise<any> => {
    const response = await api.post('/notifications/send-test');
    return response.data;
};
