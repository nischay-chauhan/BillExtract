import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body } from '../components/ui/Typography';
import { CategoryModal } from '../components/ui/CategoryModal';
import { PaymentMethodModal } from '../components/ui/PaymentMethodModal';
import { ReceiptInfoForm } from '../components/receipts/ReceiptInfoForm';
import { ReviewItemRow } from '../components/receipts/ReviewItemRow';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ReceiptItem, updateReceipt } from '../api/receipts';
import { spacing } from '../utils/responsive';
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

    const openCategoryModal = () => {
        console.log('[ReviewReceiptScreen] Opening category modal');
        setCategoryModalVisible(true);
    };

    const openPaymentModal = () => {
        console.log('[ReviewReceiptScreen] Opening payment modal');
        setPaymentMethodModalVisible(true);
    };

    const handleSave = async () => {
        const validationResult = validateReceiptData({
            store_name: storeName,
            date: date,
            total: total,
            items: items
        });

        if (validationResult.isValid && validationResult.sanitizedData) {
            validationResult.sanitizedData.category = category;
            validationResult.sanitizedData.payment_method = paymentMethod;
        }

        if (!validationResult.isValid) {
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
            console.log('[ReviewReceipt] Saving receipt:', receiptId, JSON.stringify(validationResult.sanitizedData, null, 2));

            await updateReceipt(receiptId, validationResult.sanitizedData);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Receipt saved successfully!',
                position: 'bottom',
                visibilityTime: 2000,
            });

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
        <>
            <ScreenWrapper>
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: spacing.xxl * 3 }}
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Title>Review Receipt</Title>

                    <ReceiptInfoForm
                        storeName={storeName}
                        setStoreName={setStoreName}
                        date={date}
                        setDate={setDate}
                        total={total}
                        setTotal={setTotal}
                        category={category}
                        paymentMethod={paymentMethod}
                        onCategoryPress={openCategoryModal}
                        onPaymentPress={openPaymentModal}
                    />

                    <View>
                        <View className="flex-row justify-between items-center" style={{ marginBottom: spacing.md }}>
                            <Subtitle className="mb-0">Items</Subtitle>
                            <TouchableOpacity
                                className="bg-green-500 rounded-lg"
                                style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
                                onPress={handleAddItem}
                                activeOpacity={0.7}
                            >
                                <Text className="text-white font-semibold">+ Add Item</Text>
                            </TouchableOpacity>
                        </View>

                        {items.map((item, index) => (
                            <ReviewItemRow
                                key={index}
                                item={item}
                                index={index}
                                onUpdate={handleUpdateItem}
                                onRemove={handleRemoveItem}
                            />
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
                        activeOpacity={0.7}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-semibold">Save Receipt</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>

            {/* Modals rendered at root level for proper z-index on Android */}
            <CategoryModal
                visible={categoryModalVisible}
                currentCategory={category}
                onSave={(newCategory) => {
                    console.log('[ReviewReceiptScreen] Category selected:', newCategory);
                    setCategory(newCategory);
                    setCategoryModalVisible(false);
                }}
                onCancel={() => {
                    console.log('[ReviewReceiptScreen] Category modal cancelled');
                    setCategoryModalVisible(false);
                }}
            />

            <PaymentMethodModal
                visible={paymentMethodModalVisible}
                currentMethod={paymentMethod}
                onSave={(newMethod) => {
                    console.log('[ReviewReceiptScreen] Payment method selected:', newMethod);
                    setPaymentMethod(newMethod);
                    setPaymentMethodModalVisible(false);
                }}
                onCancel={() => {
                    console.log('[ReviewReceiptScreen] Payment modal cancelled');
                    setPaymentMethodModalVisible(false);
                }}
            />
        </>
    );
};

export default ReviewReceiptScreen;
