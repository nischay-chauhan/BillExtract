import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { getReceipts, ReceiptData } from '../api/receipts';
import { RootStackParamList } from '../navigation/AppNavigator';
import { hp, wp, spacing, isSmallDevice } from '../utils/responsive';
import { formatCompactNumber } from '../utils/format';
import { sanitizeNumber } from '../utils/validation';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReceipts();
    }, [])
  );

  const totalSpent = receipts.reduce((sum, receipt) => {
    return sum + sanitizeNumber(receipt.total);
  }, 0);

  const recentReceipts = receipts.slice(0, 3);

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
      >
        <View style={{ marginBottom: spacing.md }}>
          <Title>Overview</Title>
          <Body>Welcome back! Here's your spending summary.</Body>
        </View>

        <View
          className={isSmallDevice ? "mb-6" : "flex-row justify-between mb-6"}
          style={{ gap: spacing.sm }}
        >
          {/* Purple Gradient Card - Total Spent */}
          <LinearGradient
            colors={['#9333ea', '#7e22ce']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className={isSmallDevice ? "rounded-2xl border border-purple-800 mb-2 " : "flex-1 rounded-2xl border border-purple-800"}
            style={{
              padding: spacing.md,
              minHeight: hp(100)
            }}
          >
            <Caption className="text-purple-100">Total Spent</Caption>
            <Title className="text-white mt-1 mb-0" style={{ fontSize: 24 }}>{formatCompactNumber(totalSpent)}</Title>
            <Caption className="text-purple-200 mt-2">{receipts.length} receipts</Caption>
          </LinearGradient>

          <LinearGradient
            colors={['#2563eb', '#1d4ed8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className={isSmallDevice ? "rounded-2xl border border-blue-800" : "flex-1 rounded-2xl border border-blue-800"}
            style={{
              padding: spacing.md,
              minHeight: hp(100)
            }}
          >
            <Caption className="text-blue-100">Bills Scanned</Caption>
            <Title className="text-white mt-1 mb-0">{receipts.length}</Title>
            <Caption className="text-blue-200 mt-2">All time</Caption>
          </LinearGradient>
        </View>

        <View style={{ marginBottom: spacing.sm }}>
          <Subtitle>Recent Activity</Subtitle>
        </View>

        {recentReceipts.length > 0 ? (
          recentReceipts.map((receipt, index) => {
            // Format total value
            const numericTotal = sanitizeNumber(receipt.total);
            const formattedTotal = `₹${numericTotal.toFixed(2)}`;

            return (
              <TouchableOpacity
                key={receipt._id || receipt.id || index}
                onPress={() => navigation.navigate('ReceiptDetails', { receipt })}
                activeOpacity={0.7}
              >
                <Card className="flex-row items-center justify-between" style={{ marginBottom: spacing.sm }}>
                  <View className="flex-row items-center flex-1" style={{ marginRight: spacing.sm }}>
                    <View
                      className="bg-blue-100 rounded-full items-center justify-center"
                      style={{
                        height: wp(40),
                        width: wp(40),
                        marginRight: spacing.sm
                      }}
                    >
                      <Body className="text-lg">🧾</Body>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Subtitle
                        className="text-base mb-0"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {receipt.store_name || 'Unknown Store'}
                      </Subtitle>
                      <Caption>{receipt.date || 'No date'}</Caption>
                    </View>
                  </View>
                  <Title className="text-lg mb-0 text-gray-800">{formattedTotal}</Title>
                </Card>
              </TouchableOpacity>
            );
          })
        ) : (
          <Card>
            <Body className="text-center text-gray-400">No recent receipts</Body>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default HomeScreen;




