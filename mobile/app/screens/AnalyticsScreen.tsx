import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { wp, hp, spacing, isSmallDevice, rfs } from '../utils/responsive';

const AnalyticsScreen = () => {
  // Dummy data for analytics
  const monthlySpending = [
    { month: 'Jan', amount: 342.50 },
    { month: 'Feb', amount: 478.20 },
    { month: 'Mar', amount: 523.80 },
  ];

  const topCategories = [
    { name: 'Groceries', amount: 456.30, color: ['#10b981', '#059669'] as const, icon: '🛒' },
    { name: 'Restaurants', amount: 325.50, color: ['#f59e0b', '#d97706'] as const, icon: '🍽️' },
    { name: 'Shopping', amount: 278.90, color: ['#ec4899', '#db2777'] as const, icon: '🛍️' },
    { name: 'Transport', amount: 156.20, color: ['#6366f1', '#4f46e5'] as const, icon: '🚗' },
  ];

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
        {/* Header */}
        <View style={{ marginBottom: spacing.md }}>
          <Title>Analytics</Title>
          <Body>Track your spending patterns and insights</Body>
        </View>

        {/* Month Overview Cards */}
        <View style={{ marginBottom: spacing.md }}>
          <Subtitle style={{ marginBottom: spacing.sm }}>This Month</Subtitle>
          <View className={isSmallDevice ? "mb-3" : "flex-row justify-between mb-3"} style={{ gap: spacing.sm }}>
            {/* Total Spending */}
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className={isSmallDevice ? "rounded-2xl mb-3" : "flex-1 rounded-2xl"}
              style={{ padding: spacing.md, minHeight: hp(100) }}
            >
              <Caption className="text-purple-100">Total Spending</Caption>
              <Title className="text-white mt-1 mb-0">$1,344</Title>
              <Caption className="text-purple-200 mt-1">↑ 12% from last month</Caption>
            </LinearGradient>

            {/* Average per Day */}
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className={isSmallDevice ? "rounded-2xl" : "flex-1 rounded-2xl"}
              style={{ padding: spacing.md, minHeight: hp(100) }}
            >
              <Caption className="text-cyan-100">Avg per Day</Caption>
              <Title className="text-white mt-1 mb-0">$44.80</Title>
              <Caption className="text-cyan-200 mt-1">30 days tracked</Caption>
            </LinearGradient>
          </View>

          {/* Budget Status */}
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl"
            style={{ padding: spacing.md }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Caption className="text-orange-100">Budget Status</Caption>
              <Body className="text-white font-semibold">67%</Body>
            </View>
            <View className="bg-white/20 rounded-full h-2 mb-2">
              <View className="bg-white rounded-full h-2" style={{ width: '67%' }} />
            </View>
            <Caption className="text-orange-100">$1,344 of $2,000 budget used</Caption>
          </LinearGradient>
        </View>

        {/* Top Categories */}
        <View style={{ marginBottom: spacing.md }}>
          <Subtitle style={{ marginBottom: spacing.sm }}>Top Categories</Subtitle>
          {topCategories.map((category, index) => (
            <TouchableOpacity key={index} activeOpacity={0.7}>
              <Card style={{ marginBottom: spacing.sm }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <LinearGradient
                      colors={category.color}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="rounded-xl items-center justify-center"
                      style={{ height: wp(48), width: wp(48), marginRight: spacing.sm }}
                    >
                      <Body style={{ fontSize: rfs(22) }}>{category.icon}</Body>
                    </LinearGradient>
                    <View className="flex-1">
                      <Subtitle className="text-base mb-0">{category.name}</Subtitle>
                      <Caption>{((category.amount / 1344) * 100).toFixed(0)}% of total</Caption>
                    </View>
                  </View>
                  <Title className="text-lg mb-0">${category.amount.toFixed(2)}</Title>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Monthly Trends */}
        <View style={{ marginBottom: spacing.md }}>
          <Subtitle style={{ marginBottom: spacing.sm }}>Recent Months</Subtitle>
          {monthlySpending.map((item, index) => (
            <Card key={index} className="mb-3">
              <View className="flex-row justify-between items-center">
                <View>
                  <Subtitle className="text-base mb-0">{item.month} 2025</Subtitle>
                  <Caption>Monthly spending</Caption>
                </View>
                <Title className="text-xl mb-0 text-gray-800">${item.amount.toFixed(2)}</Title>
              </View>
            </Card>
          ))}
        </View>

        {/* Quick Stats */}
        <View>
          <Subtitle style={{ marginBottom: spacing.sm }}>Quick Stats</Subtitle>
          <View className="flex-row flex-wrap justify-between" style={{ gap: spacing.sm }}>
            <Card style={{ width: isSmallDevice ? '100%' : '48%', marginBottom: spacing.sm }} className=" bg-emerald-50 border-emerald-200">
              <Caption className="text-emerald-700">Most Expensive</Caption>
              <Subtitle className="text-emerald-900 mt-1">$156.80</Subtitle>
              <Caption className="text-emerald-600">Whole Foods</Caption>
            </Card>
            <Card className="w-[48%] mb-3 bg-amber-50 border-amber-200">
              <Caption className="text-amber-700">Total Receipts</Caption>
              <Subtitle className="text-amber-900 mt-1">47</Subtitle>
              <Caption className="text-amber-600">This month</Caption>
            </Card>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AnalyticsScreen;
