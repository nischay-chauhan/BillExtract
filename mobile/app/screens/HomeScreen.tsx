import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { getReceipts, ReceiptData } from '../api/receipts';
import { RootStackParamList } from '../navigation/AppNavigator';

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

  // Calculate total spent
  const totalSpent = receipts.reduce((sum, receipt) => {
    let amount = 0;
    if (typeof receipt.total === 'number') {
      amount = receipt.total;
    } else if (typeof receipt.total === 'string') {
      const numericTotal = parseFloat(receipt.total.replace(/,/g, ''));
      if (!isNaN(numericTotal)) {
        amount = numericTotal;
      }
    }
    return sum + amount;
  }, 0);

  // Get last 3 receipts for recent activity
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="mb-6">
          <Title>Overview</Title>
          <Body>Welcome back! Here's your spending summary.</Body>
        </View>

        <View className="flex-row justify-between mb-6">
          <Card className="flex-1 mr-2 bg-gradient-to-br from-purple-600 to-purple-700 border-purple-800">
            <Caption className="text-purple-100">Total Spent</Caption>
            <Title className="text-white mt-1 mb-0">${totalSpent.toFixed(2)}</Title>
            <Caption className="text-purple-200 mt-2">{receipts.length} receipts</Caption>
          </Card>
          <Card className="flex-1 ml-2 bg-gradient-to-br from-blue-600 to-blue-700 border-blue-800">
            <Caption className="text-blue-100">Bills Scanned</Caption>
            <Title className="text-white mt-1 mb-0">{receipts.length}</Title>
            <Caption className="text-blue-200 mt-2">All time</Caption>
          </Card>
        </View>

        <View className="mb-4">
          <Subtitle>Recent Activity</Subtitle>
        </View>

        {recentReceipts.length > 0 ? (
          recentReceipts.map((receipt, index) => {
            // Format total value
            let formattedTotal = '$0.00';
            if (typeof receipt.total === 'number') {
              formattedTotal = `$${receipt.total.toFixed(2)}`;
            } else if (typeof receipt.total === 'string') {
              const numericTotal = parseFloat(receipt.total.replace(/,/g, ''));
              if (!isNaN(numericTotal)) {
                formattedTotal = `$${numericTotal.toFixed(2)}`;
              } else {
                formattedTotal = receipt.total;
              }
            }

            return (
              <TouchableOpacity
                key={receipt._id || receipt.id || index}
                onPress={() => navigation.navigate('ReceiptDetails', { receipt })}
                activeOpacity={0.7}
              >
                <Card className="mb-3 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="h-10 w-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Body className="text-lg">🧾</Body>
                    </View>
                    <View>
                      <Subtitle className="text-base mb-0">{receipt.store_name || 'Unknown Store'}</Subtitle>
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


