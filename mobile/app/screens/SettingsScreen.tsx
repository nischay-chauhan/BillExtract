import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Platform, Modal, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { wp, hp, spacing, isSmallDevice, rfs } from '../utils/responsive';
import { useAuthStore } from '../store/authStore';
import { getReceipts } from '../api/receipts';
import { generateReceiptsHTML } from '../utils/pdfGenerator';
import { usePushNotifications, scheduleLocalNotification } from '../hooks/usePushNotifications';
import { sendTestNotification } from '../api/notifications';


type SettingsItem = {
  icon: string;
  label: string;
  value: boolean | string | null;
  toggle?: ((value: boolean) => void) | ((value: boolean) => Promise<void>);
  action?: () => void;
};

const SettingsScreen = () => {
  const [autoSync, setAutoSync] = React.useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const { user, logout } = useAuthStore();
  const { isRegistered, registerForPushNotifications, unregister, expoPushToken } = usePushNotifications();

  const [notificationsEnabled, setNotificationsEnabled] = useState(isRegistered);

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      await registerForPushNotifications();
    } else {
      await unregister();
    }
  };

  const handleTestNotification = async () => {
    try {
      if (expoPushToken) {
        // Send via backend
        await sendTestNotification();
        Alert.alert('Sent!', 'Test notification sent via server.');
      } else {
        // Local notification for testing
        await scheduleLocalNotification(
          'Test Notification 🔔',
          'This is a local test notification!',
          { type: 'test' },
          2
        );
        Alert.alert('Scheduled!', 'Local notification will appear in 2 seconds.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    if (Platform.OS === 'web') {
      setShowExportOptions(true);
    } else {
      Alert.alert(
        'Export Data',
        'Choose export range:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Last 10 Transactions',
            onPress: () => exportTransactions(10, 'Last 10 Transactions')
          },
          {
            text: 'Last 30 Transactions',
            onPress: () => exportTransactions(30, 'Last 30 Transactions')
          }
        ]
      );
    }
  };

  const exportTransactions = async (limit: number, title: string) => {
    let webWindow: any = null;

    try {
      if (Platform.OS === 'web') {
        webWindow = window.open('', '_blank');
        if (!webWindow) {
          Alert.alert('Popup Blocked', 'Please allow popups for this site to generate reports.');
          return;
        }
        webWindow.document.write('<html><body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh;"><h2>Generating PDF Report...</h2></body></html>');
      }

      setIsExporting(true);

      const receipts = await getReceipts(1, limit);

      if (receipts.length === 0) {
        if (webWindow) webWindow.close();
        Alert.alert('No Data', 'No transactions found to export.');
        return;
      }

      // 2. Generate HTML
      const html = generateReceiptsHTML(receipts, title);

      // 3. Handle Web vs Native
      if (Platform.OS === 'web' && webWindow) {
        webWindow.document.open();
        webWindow.document.write(html);
        webWindow.document.close();

        // Small delay to ensure rendering before print dialog
        setTimeout(() => {
          webWindow.print();
        }, 500);
      } else {
        // On native, generate a PDF file and share/save it.
        const { uri } = await Print.printToFileAsync({ html });
        console.log('PDF generated at:', uri);
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }

    } catch (error) {
      console.error('Export failed:', error);
      if (webWindow) webWindow.close();
      Alert.alert('Export Failed', 'Could not generate PDF report.');
    } finally {
      setIsExporting(false);
    }
  };

  const settingsSections: { title: string; items: SettingsItem[] }[] = [
    {
      title: 'Account',
      items: [
        { icon: '👤', label: 'Profile Settings', value: null },
        { icon: '🔒', label: 'Privacy & Security', value: null },
        { icon: '💳', label: 'Payment Methods', value: null },
        { icon: '🚪', label: 'Log Out', value: null },
      ],
    },
    {
      title: 'Preferences',
      items: [
        // { icon: '🔔', label: 'Notifications', value: notificationsEnabled, toggle: handleNotificationToggle },
        // { icon: '📲', label: 'Test Notification', value: null, action: handleTestNotification },
        { icon: '🔄', label: 'Auto Sync', value: autoSync, toggle: setAutoSync },
      ],
    },
    {
      title: 'Data',
      items: [
        { icon: '📊', label: 'Export Data', value: null, action: handleExportData },
        { icon: '☁️', label: 'Backup & Restore', value: null },
        { icon: '🗑️', label: 'Clear Cache', value: '24 MB' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: '❓', label: 'Help Center', value: null },
        { icon: '📧', label: 'Contact Support', value: null },
        { icon: '⭐', label: 'Rate the App', value: null },
      ],
    },
  ];

  const avatarSize = wp(64);
  const iconSize = wp(40);

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
      >
        <View style={{ marginBottom: spacing.md }}>
          <Title>Settings</Title>
          <Body>Manage your account and preferences</Body>
        </View>

        <LinearGradient
          colors={['#6366f1', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl"
          style={{
            padding: spacing.md,
            marginBottom: spacing.md
          }}
        >
          <View className="flex-row items-center">
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              className="rounded-full items-center justify-center"
              style={{
                height: avatarSize,
                width: avatarSize,
                marginRight: spacing.md
              }}
            >
              <Body style={{ fontSize: rfs(28) }}>👤</Body>
            </LinearGradient>
            <View className="flex-1">
              <Subtitle className="text-white mb-0">{user?.email?.split('@')[0] || 'User'}</Subtitle>
              <Caption className="text-indigo-100 mt-1">{user?.email || 'user@example.com'}</Caption>
              <Caption className="text-indigo-200 mt-1">Free Member</Caption>
            </View>
            <TouchableOpacity
              className="bg-white/20 rounded-lg"
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm
              }}
            >
              <Body className="text-white font-semibold">Edit</Body>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#f59e0b', '#d97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl"
          style={{
            padding: spacing.md,
            marginBottom: spacing.md
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Subtitle className="text-white mb-1">Upgrade to Pro</Subtitle>
              <Caption className="text-orange-100">Unlock advanced analytics & unlimited storage</Caption>
            </View>
            <View
              className="bg-white rounded-lg"
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm
              }}
            >
              <Body className="text-orange-600 font-bold">₹999</Body>
            </View>
          </View>
        </LinearGradient>

        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={{ marginBottom: spacing.md }}>
            <Subtitle style={{ marginBottom: spacing.sm }}>{section.title}</Subtitle>
            <Card className="p-0 overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  activeOpacity={0.7}
                  style={{ padding: spacing.md }}
                  className={itemIndex !== section.items.length - 1 ? 'border-b border-gray-100' : ''}
                  onPress={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.label === 'Log Out') {
                      handleLogout();
                    }
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl items-center justify-center"
                        style={{
                          height: iconSize,
                          width: iconSize,
                          marginRight: spacing.sm
                        }}
                      >
                        <Body style={{ fontSize: rfs(18) }}>{item.icon}</Body>
                      </View>
                      <View className="flex-1">
                        <Body className="text-gray-900 font-medium">{item.label}</Body>
                      </View>
                    </View>
                    {item.toggle ? (
                      <Switch
                        value={item.value as boolean}
                        onValueChange={item.toggle}
                        trackColor={{ false: '#d1d5db', true: '#6366f1' }}
                        thumbColor={item.value ? '#fff' : '#f3f4f6'}
                      />
                    ) : typeof item.value === 'string' ? (
                      <Caption style={{ marginRight: spacing.sm }}>{item.value}</Caption>
                    ) : (
                      <Body className="text-gray-400">›</Body>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        <Card className="items-center" style={{ marginTop: spacing.md }}>
          <Caption className="text-center">Bill Extractor v1.0.0</Caption>
          <Caption className="text-center text-gray-400 mt-1">Made with ❤️ by Your Team</Caption>
        </Card>

        <TouchableOpacity
          activeOpacity={0.8}
          style={{ marginTop: spacing.md }}
          onPress={handleLogout}
        >
          <Card className="bg-red-50 border-red-200">
            <Body className="text-red-600 font-semibold text-center">Log Out</Body>
          </Card>
        </TouchableOpacity>
      </ScrollView>

      {/* Web Export Options Modal */}
      <Modal
        visible={showExportOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExportOptions(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowExportOptions(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <Title className="text-center mb-2">Export Data</Title>
                <Body className="text-center text-gray-500 mb-6">Choose export range:</Body>

                <TouchableOpacity
                  className="bg-indigo-50 p-4 rounded-xl mb-3"
                  onPress={() => {
                    setShowExportOptions(false);
                    exportTransactions(10, 'Last 10 Transactions');
                  }}
                >
                  <Body className="text-indigo-600 text-center font-semibold">Last 10 Transactions</Body>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-indigo-50 p-4 rounded-xl mb-3"
                  onPress={() => {
                    setShowExportOptions(false);
                    exportTransactions(30, 'Last 30 Transactions');
                  }}
                >
                  <Body className="text-indigo-600 text-center font-semibold">Last 30 Transactions</Body>
                </TouchableOpacity>

                <TouchableOpacity
                  className="p-4 rounded-xl"
                  onPress={() => setShowExportOptions(false)}
                >
                  <Body className="text-gray-500 text-center font-medium">Cancel</Body>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {isExporting && (
        <View className="absolute inset-0 bg-black/30 items-center justify-center z-50">
          <Card className="items-center p-6">
            <ActivityIndicator size="large" color="#4f46e5" />
            <Body className="mt-4 font-medium">Generating PDF Report...</Body>
          </Card>
        </View>
      )}
    </ScreenWrapper>
  );
};

export default SettingsScreen;
