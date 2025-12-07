import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ReceiptsScreen from '../screens/ReceiptsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReviewReceiptScreen from '../screens/ReviewReceiptScreen';
import ReceiptDetailsScreen from '../screens/ReceiptDetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { ReceiptData } from '../api/receipts';
import { useAuthStore } from '../store/authStore';

import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  ReviewReceipt: {
    receiptData: ReceiptData;
    receiptId: string;
    confidence: number;
    status: string;
  };
  ReceiptDetails: {
    receipt: ReceiptData;
  };
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Receipts: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createMaterialTopTabNavigator<MainTabParamList>();
const AuthStack = createStackNavigator<RootStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};



// Tab configuration for the swipeable view
const TAB_CONFIG = [
  { name: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { name: 'Scan', icon: 'scan', iconOutline: 'scan-outline' },
  { name: 'Receipts', icon: 'receipt', iconOutline: 'receipt-outline' },
  { name: 'Analytics', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
  { name: 'Settings', icon: 'settings', iconOutline: 'settings-outline' },
] as const;

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
      }}
      tabBar={({ state, descriptors, navigation }) => (
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            height: Platform.OS === 'ios' ? 88 : 65,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 10,
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const tabConfig = TAB_CONFIG.find(t => t.name === route.name);

            if (!tabConfig) return null;

            const iconName = isFocused ? tabConfig.icon : tabConfig.iconOutline;
            const color = isFocused ? '#5B21B6' : '#94A3B8';

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={iconName as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={color}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color,
                    marginTop: 4,
                  }}
                >
                  {tabConfig.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Receipts" component={ReceiptsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};


const AppNavigator = () => {
  const { isAuthenticated, isLoading, loadToken } = useAuthStore();

  useEffect(() => {
    loadToken();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              opacity: progress,
            },
          }),
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="ReviewReceipt"
              component={ReviewReceiptScreen}
              options={{
                headerShown: false,
                title: 'Review Receipt',
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="ReceiptDetails"
              component={ReceiptDetailsScreen}
              options={{
                headerShown: false,
                title: 'Receipt Details',
                presentation: 'card',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
