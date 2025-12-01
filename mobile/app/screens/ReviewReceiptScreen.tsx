import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ReceiptItem, updateReceipt } from '../api/receipts';

type ReviewReceiptRouteProp = RouteProp<RootStackParamList, 'ReviewReceipt'>;
type ReviewReceiptNavigationProp = StackNavigationProp<RootStackParamList, 'ReviewReceipt'>;

const ReviewReceiptScreen = () => {
    const route = useRoute<ReviewReceiptRouteProp>();
    const navigation = useNavigation<ReviewReceiptNavigationProp>();

    const { receiptData, receiptId, confidence, status } = route.params;

    // State for editable fields
    const [storeName, setStoreName] = useState(receiptData.store_name || '');
    const [date, setDate] = useState(receiptData.date || '');
    const [total, setTotal] = useState(receiptData.total?.toString() || '0.00');
    const [items, setItems] = useState<ReceiptItem[]>(receiptData.items || []);
    const [saving, setSaving] = useState(false);

    const handleAddItem = () => {
        setItems([...items, { name: '', quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleUpdateItem = (
        index: number,
        field: keyof ReceiptItem,
        value: string | number
    ) => {
        const newItems = [...items];
        if (field === 'quantity' || field === 'price') {
            newItems[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
        } else {
            newItems[index][field] = value as string;
        }
        setItems(newItems);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updatePayload = {
                store_name: storeName,
                date: date,
                total: parseFloat(total) || 0,
                items: items,
            };

            console.log('[ReviewReceipt] State values:', { storeName, date, total, items });
            console.log('[ReviewReceipt] Saving receipt:', receiptId, JSON.stringify(updatePayload, null, 2));

            await updateReceipt(receiptId, updatePayload);

            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'Main',
                        params: { screen: 'Receipts' },
                    },
                ],
            });
        } catch (error: any) {
            console.error('[ReviewReceipt] Save failed:', error);
            Alert.alert('Error', error.message || 'Failed to save receipt');
            setSaving(false);
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Title>Review Receipt</Title>

                <View className="mb-4">
                    <Subtitle className="mb-2">Store Name</Subtitle>
                    <TextInput
                        className="bg-white border border-gray-200 rounded-xl p-3 text-base text-gray-900"
                        value={storeName}
                        onChangeText={setStoreName}
                        placeholder="Enter store name"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View className="mb-4">
                    <Subtitle className="mb-2">Date</Subtitle>
                    <TextInput
                        className="bg-white border border-gray-200 rounded-xl p-3 text-base text-gray-900"
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
                <View className="mb-6">
                    <Subtitle className="mb-2">Total Amount</Subtitle>
                    <TextInput
                        className="bg-white border border-gray-200 rounded-xl p-3 text-base text-gray-900"
                        value={total}
                        onChangeText={setTotal}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View>
                    <View className="flex-row justify-between items-center mb-4">
                        <Subtitle className="mb-0">Items</Subtitle>
                        <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-lg" onPress={handleAddItem}>
                            <Text className="text-white font-semibold">+ Add Item</Text>
                        </TouchableOpacity>
                    </View>

                    {items.map((item, index) => (
                        <Card key={index} className="mb-4">
                            <View className="flex-row justify-between items-center mb-3">
                                <Body className="font-semibold text-gray-500">Item {index + 1}</Body>
                                <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                                    <Text className="text-red-500 font-semibold">Remove</Text>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 text-base text-gray-900"
                                value={item.name}
                                onChangeText={(value) => handleUpdateItem(index, 'name', value)}
                                placeholder="Item name"
                                placeholderTextColor="#9CA3AF"
                            />

                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <Caption className="mb-1">Quantity</Caption>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-900"
                                        value={item.quantity.toString()}
                                        onChangeText={(value) => handleUpdateItem(index, 'quantity', value)}
                                        keyboardType="numeric"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>

                                <View className="flex-1">
                                    <Caption className="mb-1">Price</Caption>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-900"
                                        value={item.price.toString()}
                                        onChangeText={(value) => handleUpdateItem(index, 'price', value)}
                                        keyboardType="decimal-pad"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>
                        </Card>
                    ))}

                    {items.length === 0 && (
                        <Body className="text-center text-gray-400 mt-4">No items added yet</Body>
                    )}
                </View>
            </ScrollView>

            {/* Save Button */}
            <View className="absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-gray-200">
                <TouchableOpacity
                    className={`bg-blue-600 py-4 rounded-xl items-center ${saving ? 'opacity-50' : ''}`}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-lg font-semibold">Save Receipt</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
};

export default ReviewReceiptScreen;

