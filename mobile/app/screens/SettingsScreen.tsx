import React from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { wp, hp, spacing, isSmallDevice, rfs } from '../utils/responsive';

type SettingsItem = {
  icon: string;
  label: string;
  value: boolean | string | null;
  toggle?: React.Dispatch<React.SetStateAction<boolean>>;
};

const SettingsScreen = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [autoSync, setAutoSync] = React.useState(true);

  const settingsSections: { title: string; items: SettingsItem[] }[] = [
    {
      title: 'Account',
      items: [
        { icon: '👤', label: 'Profile Settings', value: null },
        { icon: '🔒', label: 'Privacy & Security', value: null },
        { icon: '💳', label: 'Payment Methods', value: null },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: '🔔', label: 'Notifications', value: notifications, toggle: setNotifications },
        { icon: '🌙', label: 'Dark Mode', value: darkMode, toggle: setDarkMode },
        { icon: '🔄', label: 'Auto Sync', value: autoSync, toggle: setAutoSync },
      ],
    },
    {
      title: 'Data',
      items: [
        { icon: '📊', label: 'Export Data', value: null },
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
              <Body style={{ fontSize: rfs(28) }}>👨‍💼</Body>
            </LinearGradient>
            <View className="flex-1">
              <Subtitle className="text-white mb-0">John Doe</Subtitle>
              <Caption className="text-indigo-100 mt-1">john.doe@example.com</Caption>
              <Caption className="text-indigo-200 mt-1">Premium Member</Caption>
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
              <Body className="text-orange-600 font-bold">$9.99</Body>
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

        <TouchableOpacity activeOpacity={0.8} style={{ marginTop: spacing.md }}>
          <Card className="bg-red-50 border-red-200">
            <Body className="text-red-600 font-semibold text-center">Log Out</Body>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default SettingsScreen;
