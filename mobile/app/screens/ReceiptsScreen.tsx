import React, { useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Caption, Body } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { getReceipts, ReceiptData } from '../api/receipts';
import { RootStackParamList } from '../navigation/AppNavigator';

type ReceiptsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ReceiptsScreen = () => {
  const navigation = useNavigation<ReceiptsScreenNavigationProp>();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReceipts = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReceipts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceipts();
  };

  if (loading && !refreshing) {
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
      <View className="mb-4">
        <Title>My Receipts</Title>
      </View>

      <FlatList
        data={receipts}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Body className="text-gray-400">No receipts found</Body>
          </View>
        }
        renderItem={({ item }) => {
          let formattedTotal = '$0.00';
          if (typeof item.total === 'number') {
            formattedTotal = `$${item.total.toFixed(2)}`;
          } else if (typeof item.total === 'string') {
            const numericTotal = parseFloat(item.total.replace(/,/g, ''));
            if (!isNaN(numericTotal)) {
              formattedTotal = `$${numericTotal.toFixed(2)}`;
            } else {
              formattedTotal = item.total;
            }
          }

          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('ReceiptDetails', { receipt: item })}
              activeOpacity={0.7}
            >
              <Card className="mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Subtitle className="mb-0">{item.store_name || 'Unknown Store'}</Subtitle>
                    <Caption>{item.date || 'No date'}</Caption>
                  </View>
                  <Title className="text-xl text-blue-600 mb-0">{formattedTotal}</Title>
                </View>
                <View className="flex-row justify-between items-center border-t border-gray-100 pt-2 mt-1">
                  <Caption>{item.items?.length || 0} items</Caption>
                  <Body className="text-sm text-blue-500 font-medium">View Details →</Body>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenWrapper>
  );
};

export default ReceiptsScreen;

