import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Caption, Body } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { FadeInView } from '../components/ui/FadeInView';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { getReceipts, ReceiptData, getCachedReceipts, invalidateReceiptsCache } from '../api/receipts';
import { RootStackParamList } from '../navigation/AppNavigator';
import { spacing } from '../utils/responsive';
import { formatDate } from '../utils/format';
import { sanitizeNumber } from '../utils/validation';

type ReceiptsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ReceiptsScreen = () => {
  const navigation = useNavigation<ReceiptsScreenNavigationProp>();
  const [receipts, setReceipts] = useState<ReceiptData[]>(getCachedReceipts() || []);
  const [loading, setLoading] = useState(!getCachedReceipts());
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Date Range Filtering State
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
  const [focusKey, setFocusKey] = useState(0);

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

  useEffect(() => {
    fetchReceipts();
  }, []);

  // Trigger animations on each screen focus
  useFocusEffect(
    useCallback(() => {
      setFocusKey(prev => prev + 1);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    invalidateReceiptsCache();
    fetchReceipts();
  };

  const getAmount = (r: ReceiptData) => {
    return sanitizeNumber(r.total);
  };

  const sortedReceipts = useMemo(() => {
    let filtered = [...receipts];

    // Filter by Date Range
    if (startDate || endDate) {
      filtered = filtered.filter(r => {
        if (!r.date) return false;
        const rDate = new Date(r.date).getTime();

        let inRange = true;
        if (startDate) {
          inRange = inRange && rDate >= startDate.getTime();
        }
        if (endDate) {
          // Set end date to end of day
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          inRange = inRange && rDate <= endOfDay.getTime();
        }
        return inRange;
      });
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const amountA = getAmount(a);
        const amountB = getAmount(b);
        return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
      }
    });
  }, [receipts, sortBy, sortOrder, startDate, endDate]);

  const toggleSort = (type: 'date' | 'amount') => {
    if (sortBy === type) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentPicker = showPicker;
    setShowPicker(null);

    if (event.type === 'dismissed' || !selectedDate) return;

    if (currentPicker === 'start') {
      setStartDate(selectedDate);
    } else if (currentPicker === 'end') {
      setEndDate(selectedDate);
    }
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
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
      <View style={{ marginBottom: spacing.md }}>
        <Title>My Receipts</Title>
        <View className="flex-row mt-4" style={{ gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => toggleSort('date')}
            className={`flex-row items-center px-4 py-2 rounded-full border ${sortBy === 'date' ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
          >
            <Text className={`font-medium ${sortBy === 'date' ? 'text-white' : 'text-gray-700'}`}>Date</Text>
            {sortBy === 'date' && (
              <Ionicons name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} size={16} color="white" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleSort('amount')}
            className={`flex-row items-center px-4 py-2 rounded-full border ${sortBy === 'amount' ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
          >
            <Text className={`font-medium ${sortBy === 'amount' ? 'text-white' : 'text-gray-700'}`}>Amount</Text>
            {sortBy === 'amount' && (
              <Ionicons name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} size={16} color="white" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
        </View>

        {/* Date Range Picker UI */}
        <View className="flex-row items-center mt-4" style={{ gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => setShowPicker('start')}
            className="flex-1 flex-row items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-2"
          >
            <Text className={startDate ? "text-gray-900" : "text-gray-400"}>
              {startDate ? formatDate(startDate.toISOString()) : "Start Date"}
            </Text>
            <Ionicons name="calendar-outline" size={16} color="gray" />
          </TouchableOpacity>

          <Text className="text-gray-400">-</Text>

          <TouchableOpacity
            onPress={() => setShowPicker('end')}
            className="flex-1 flex-row items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-2"
          >
            <Text className={endDate ? "text-gray-900" : "text-gray-400"}>
              {endDate ? formatDate(endDate.toISOString()) : "End Date"}
            </Text>
            <Ionicons name="calendar-outline" size={16} color="gray" />
          </TouchableOpacity>

          {(startDate || endDate) && (
            <TouchableOpacity onPress={clearDateFilter} className="bg-gray-200 p-2 rounded-full">
              <Ionicons name="close" size={16} color="gray" />
            </TouchableOpacity>
          )}
        </View>

        {showPicker && (
          Platform.OS === 'web' ? (
            <View className="mt-2 bg-gray-100 p-2 rounded-lg">
              <Text className="text-xs text-gray-500 mb-1">
                {showPicker === 'start' ? 'Start Date' : 'End Date'}
              </Text>
              {React.createElement('input', {
                type: 'date',
                value: showPicker === 'start' ? (startDate?.toISOString().split('T')[0] || '') : (endDate?.toISOString().split('T')[0] || ''),
                onChange: (e: any) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  onDateChange({ type: 'set' }, date);
                },
                style: {
                  padding: 8,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  width: '100%'
                }
              })}
              <TouchableOpacity
                onPress={() => setShowPicker(null)}
                className="mt-2 items-end"
              >
                <Text className="text-blue-600">Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <DateTimePicker
              value={showPicker === 'start' ? (startDate || new Date()) : (endDate || new Date())}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )
        )}
      </View>

      <FlatList
        data={sortedReceipts}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Body className="text-gray-400">No receipts found</Body>
          </View>
        }
        renderItem={({ item, index }) => {
          const numericTotal = sanitizeNumber(item.total);

          return (
            <FadeInView key={`receipt-${item._id || item.id}-${focusKey}`} delay={index * 50} duration={400}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ReceiptDetails', { receipt: item })}
                activeOpacity={0.7}
              >
                <Card
                  style={{
                    marginBottom: spacing.md,
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                  className="bg-white rounded-xl"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Subtitle className="mb-0">{item.store_name || 'Unknown Store'}</Subtitle>
                      <Caption>{formatDate(item.date)}</Caption>
                    </View>
                    <AnimatedNumber
                      value={numericTotal}
                      prefix="₹"
                      decimalPlaces={2}
                      duration={600}
                      resetKey={focusKey}
                      style={{ fontSize: 18, fontWeight: 'bold', color: '#2563eb' }}
                    />
                  </View>
                  <View className="flex-row justify-between items-center border-t border-gray-100 pt-2 mt-1">
                    <Caption>{item.items?.length || 0} items</Caption>
                    <Body className="text-sm text-blue-500 font-medium">View Details →</Body>
                  </View>
                </Card>
              </TouchableOpacity>
            </FadeInView>
          );
        }}
      />
    </ScreenWrapper>
  );
};

export default ReceiptsScreen;

