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
import Toast from 'react-native-toast-message';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { CategoryModal } from '../components/ui/CategoryModal';
import { PaymentMethodModal } from '../components/ui/PaymentMethodModal';
import { Ionicons } from '@expo/vector-icons';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ReceiptItem, updateReceipt } from '../api/receipts';
import { spacing, rfs } from '../utils/responsive';
import { validateReceiptData } from '../utils/validation';

type ReviewReceiptRouteProp = RouteProp<RootStackParamList, 'ReviewReceipt'>;
type ReviewReceiptNavigationProp = StackNavigationProp<RootStackParamList, 'ReviewReceipt'>;

const ReviewReceiptScreen = () => {
    const route = useRoute<ReviewReceiptRouteProp>();
    const navigation = useNavigation<ReviewReceiptNavigationProp>();

    const { receiptData, receiptId, confidence, status } = route.params;

    const [storeName, setStoreName] = useState(receiptData.store_name || '');
    const [date, setDate] = useState(receiptData.date || '');
    const [total, setTotal] = useState(receiptData.total?.toString() || '0.00');
    const [category, setCategory] = useState(receiptData.category || 'general');
    const [paymentMethod, setPaymentMethod] = useState(receiptData.payment_method || 'Cash');
    const [items, setItems] = useState<ReceiptItem[]>(receiptData.items || []);

    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [paymentMethodModalVisible, setPaymentMethodModalVisible] = useState(false);
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
        // Validate data before saving
        const validationResult = validateReceiptData({
            store_name: storeName,
            date: date,
            total: total,
            items: items
        });

        // Add category and payment method to sanitized data
        if (validationResult.isValid && validationResult.sanitizedData) {
            validationResult.sanitizedData.category = category;
            validationResult.sanitizedData.payment_method = paymentMethod;
        }

        if (!validationResult.isValid) {
            // Show first error via toast
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: validationResult.errors[0],
                position: 'bottom',
                visibilityTime: 4000,
            });
            return;
        }

        setSaving(true);
        try {
            console.log('[ReviewReceipt] State values:', { storeName, date, total, items });
            console.log('[ReviewReceipt] Saving receipt:', receiptId, JSON.stringify(validationResult.sanitizedData, null, 2));

            await updateReceipt(receiptId, validationResult.sanitizedData);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Receipt saved successfully!',
                position: 'bottom',
                visibilityTime: 2000,
            });

            // Navigate after a short delay to show the toast
            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'Main',
                            params: { screen: 'Receipts' },
                        },
                    ],
                });
            }, 500);
        } catch (error: any) {
            console.error('[ReviewReceipt] Save failed:', error);

            // Extract error message from server response
            let errorMessage = 'Failed to save receipt';
            if (error.message) {
                errorMessage = error.message;
            }

            Toast.show({
                type: 'error',
                text1: 'Save Failed',
                text2: errorMessage,
                position: 'bottom',
                visibilityTime: 4000,
            });
            setSaving(false);
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: spacing.xxl * 3 }}
                style={{ flex: 1 }}
            >
                <Title>Review Receipt</Title>

                <View style={{ marginBottom: spacing.md }}>
                    <Subtitle style={{ marginBottom: spacing.sm }}>Store Name</Subtitle>
                    <TextInput
                        className="bg-white border border-gray-200 rounded-xl text-gray-900"
                        style={{ padding: spacing.sm, fontSize: rfs(14) }}
                        value={storeName}
                        onChangeText={setStoreName}
                        placeholder="Enter store name"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={{ marginBottom: spacing.md }}>
                    <Subtitle style={{ marginBottom: spacing.sm }}>Date</Subtitle>
                    <TextInput
                        className="bg-white border border-gray-200 rounded-xl text-gray-900"
                        style={{ padding: spacing.sm, fontSize: rfs(14) }}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
                <View style={{ marginBottom: spacing.md }}>
                    <Subtitle style={{ marginBottom: spacing.sm }}>Total Amount</Subtitle>
                    <TextInput
                        className="bg-white border border-gray-200 rounded-xl text-gray-900"
                        style={{ padding: spacing.sm, fontSize: rfs(14) }}
                        value={total}
                        onChangeText={setTotal}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={{ marginBottom: spacing.md, flexDirection: 'row', gap: spacing.md }}>
                    <View style={{ flex: 1 }}>
                        <Subtitle style={{ marginBottom: spacing.sm }}>Category</Subtitle>
                        <TouchableOpacity
                            onPress={() => setCategoryModalVisible(true)}
                            className="bg-white border border-gray-200 rounded-xl flex-row items-center justify-between"
                            style={{ padding: spacing.sm }}
                        >
                            <Body className="text-gray-900 capitalize">{category.replace('_', ' ')}</Body>
                            <Ionicons name="chevron-down" size={rfs(16)} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Subtitle style={{ marginBottom: spacing.sm }}>Payment</Subtitle>
                        <TouchableOpacity
                            onPress={() => setPaymentMethodModalVisible(true)}
                            className="bg-white border border-gray-200 rounded-xl flex-row items-center justify-between"
                            style={{ padding: spacing.sm }}
                        >
                            <Body className="text-gray-900">{paymentMethod}</Body>
                            <Ionicons name="chevron-down" size={rfs(16)} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    <View className="flex-row justify-between items-center" style={{ marginBottom: spacing.md }}>
                        <Subtitle className="mb-0">Items</Subtitle>
                        <TouchableOpacity
                            className="bg-green-500 rounded-lg"
                            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
                            onPress={handleAddItem}
                        >
                            <Text className="text-white font-semibold">+ Add Item</Text>
                        </TouchableOpacity>
                    </View>

                    {items.map((item, index) => (
                        <Card key={index} style={{ marginBottom: spacing.md }}>
                            <View className="flex-row justify-between items-center" style={{ marginBottom: spacing.sm }}>
                                <Body className="font-semibold text-gray-500">Item {index + 1}</Body>
                                <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                                    <Text className="text-red-500 font-semibold">Remove</Text>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                                style={{ padding: spacing.sm, marginBottom: spacing.sm, fontSize: rfs(14) }}
                                value={item.name}
                                onChangeText={(value) => handleUpdateItem(index, 'name', value)}
                                placeholder="Item name"
                                placeholderTextColor="#9CA3AF"
                            />

                            <View className="flex-row" style={{ gap: spacing.sm }}>
                                <View className="flex-1">
                                    <Caption className="mb-1">Quantity</Caption>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                                        style={{ padding: spacing.sm, fontSize: rfs(12) }}
                                        value={item.quantity.toString()}
                                        onChangeText={(value) => handleUpdateItem(index, 'quantity', value)}
                                        keyboardType="numeric"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>

                                <View className="flex-1">
                                    <Caption className="mb-1">Price</Caption>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                                        style={{ padding: spacing.sm, fontSize: rfs(12) }}
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

            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200" style={{ padding: spacing.md }}>
                <TouchableOpacity
                    className={`bg-blue-600 rounded-xl items-center ${saving ? 'opacity-50' : ''}`}
                    style={{ paddingVertical: spacing.md }}
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

            <CategoryModal
                visible={categoryModalVisible}
                currentCategory={category}
                onSave={(newCategory) => {
                    setCategory(newCategory);
                    setCategoryModalVisible(false);
                }}
                onCancel={() => setCategoryModalVisible(false)}
            />

            <PaymentMethodModal
                visible={paymentMethodModalVisible}
                currentMethod={paymentMethod}
                onSave={(newMethod) => {
                    setPaymentMethod(newMethod);
                    setPaymentMethodModalVisible(false);
                }}
                onCancel={() => setPaymentMethodModalVisible(false)}
            />
        </ScreenWrapper>
    );
};

export default ReviewReceiptScreen;

