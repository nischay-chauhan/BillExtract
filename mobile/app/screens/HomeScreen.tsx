import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { FadeInView } from '../components/ui/FadeInView';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
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
  const [focusKey, setFocusKey] = useState(0);

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
      setFocusKey(prev => prev + 1); // Trigger animations on each focus
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
        {/* Header with fade-in animation */}
        <FadeInView key={`header-${focusKey}`} delay={0} duration={500}>
          <View style={{ marginBottom: spacing.md }}>
            <Title>Overview</Title>
            <Body>Welcome back! Here's your spending summary.</Body>
          </View>
        </FadeInView>

        <View
          className={isSmallDevice ? "mb-6" : "flex-row justify-between mb-6"}
          style={{ gap: spacing.sm }}
        >
          {/* Purple Gradient Card - Total Spent */}
          <FadeInView key={`total-${focusKey}`} delay={100} duration={500} style={{ flex: isSmallDevice ? undefined : 1 }}>
            <LinearGradient
              colors={['#9333ea', '#7e22ce']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className={isSmallDevice ? "rounded-2xl border border-purple-800 mb-2 " : "rounded-2xl border border-purple-800"}
              style={{
                padding: spacing.md,
                minHeight: hp(100)
              }}
            >
              <Caption className="text-purple-100">Total Spent</Caption>
              <AnimatedNumber
                value={totalSpent}
                prefix="₹"
                compact
                duration={1000}
                resetKey={focusKey}
                style={{ fontSize: 24, color: '#fff', fontWeight: 'bold', marginTop: 4, marginBottom: 0 }}
              />
              <Caption className="text-purple-200 mt-2">{receipts.length} receipts</Caption>
            </LinearGradient>
          </FadeInView>

          {/* Blue Gradient Card - Bills Scanned */}
          <FadeInView key={`bills-${focusKey}`} delay={200} duration={500} style={{ flex: isSmallDevice ? undefined : 1 }}>
            <LinearGradient
              colors={['#2563eb', '#1d4ed8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className={isSmallDevice ? "rounded-2xl border border-blue-800" : "rounded-2xl border border-blue-800"}
              style={{
                padding: spacing.md,
                minHeight: hp(100)
              }}
            >
              <Caption className="text-blue-100">Bills Scanned</Caption>
              <AnimatedNumber
                value={receipts.length}
                decimalPlaces={0}
                duration={800}
                resetKey={focusKey}
                style={{ fontSize: 24, color: '#fff', fontWeight: 'bold', marginTop: 4, marginBottom: 0 }}
              />
              <Caption className="text-blue-200 mt-2">All time</Caption>
            </LinearGradient>
          </FadeInView>
        </View>

        {/* Recent Activity Header */}
        <FadeInView key={`activity-${focusKey}`} delay={300} duration={500}>
          <View style={{ marginBottom: spacing.sm }}>
            <Subtitle>Recent Activity</Subtitle>
          </View>
        </FadeInView>

        {recentReceipts.length > 0 ? (
          recentReceipts.map((receipt, index) => {
            // Format total value
            const numericTotal = sanitizeNumber(receipt.total);

            return (
              <FadeInView key={`${receipt._id || receipt.id || index}-${focusKey}`} delay={350 + index * 100} duration={400}>
                <TouchableOpacity
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
                    <AnimatedNumber
                      value={numericTotal}
                      prefix="₹"
                      decimalPlaces={2}
                      duration={800}
                      resetKey={focusKey}
                      style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}
                    />
                  </Card>
                </TouchableOpacity>
              </FadeInView>
            );
          })
        ) : (
          <FadeInView delay={400} duration={400}>
            <Card>
              <Body className="text-center text-gray-400">No recent receipts</Body>
            </Card>
          </FadeInView>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default HomeScreen;




