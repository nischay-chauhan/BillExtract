import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { CategoryModal } from '../components/ui/CategoryModal';
import { RootStackParamList } from '../navigation/AppNavigator';
import { spacing, rfs } from '../utils/responsive';
import { updateReceiptCategory, updateReceipt } from '../api/receipts';
import { ReceiptData } from '../api/receipts';
import { sanitizeNumber } from '../utils/validation';
import { PaymentMethodModal } from '../components/ui/PaymentMethodModal';

type ReceiptDetailsRouteProp = RouteProp<RootStackParamList, 'ReceiptDetails'>;
type ReceiptDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'ReceiptDetails'>;

const ReceiptDetailsScreen = () => {
    const route = useRoute<ReceiptDetailsRouteProp>();
    const navigation = useNavigation<ReceiptDetailsNavigationProp>();
    const { receipt } = route.params;

    const [currentReceipt, setCurrentReceipt] = useState<ReceiptData>(receipt);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [paymentMethodModalVisible, setPaymentMethodModalVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handlePaymentMethodUpdate = async (newMethod: string) => {
        try {
            setIsUpdating(true);
            const receiptId = currentReceipt._id || currentReceipt.id;
            if (!receiptId) throw new Error('No receipt ID');

            const updated = await updateReceipt(receiptId, { payment_method: newMethod });
            setCurrentReceipt({ ...currentReceipt, payment_method: newMethod });
            setPaymentMethodModalVisible(false);
        } catch (error) {
            console.error('Failed to update payment method:', error);
            alert('Failed to update payment method');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCategoryUpdate = async (newCategory: string) => {
        try {
            setIsUpdating(true);
            const receiptId = currentReceipt._id || currentReceipt.id;
            if (!receiptId) throw new Error('No receipt ID');

            const updated = await updateReceiptCategory(receiptId, newCategory);
            setCurrentReceipt({ ...currentReceipt, category: newCategory });
            setCategoryModalVisible(false);
        } catch (error) {
            console.error('Failed to update category:', error);
            alert('Failed to update category');
        } finally {
            setIsUpdating(false);
        }
    };

    const getCategoryLabel = (category?: string): string => {
        if (!category) return 'Uncategorized';
        const labels: Record<string, string> = {
            grocery: 'Grocery',
            restaurant: 'Restaurant',
            petrol: 'Petrol/Fuel',
            pharmacy: 'Pharmacy',
            electronics: 'Electronics',
            food_delivery: 'Food Delivery',
            parking: 'Parking',
            toll: 'Toll',
            general: 'General'
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category?: string): string => {
        if (!category) return '#757575';
        const colors: Record<string, string> = {
            grocery: '#4CAF50',
            restaurant: '#FF9800',
            petrol: '#2196F3',
            pharmacy: '#E91E63',
            electronics: '#9C27B0',
            food_delivery: '#FF5722',
            parking: '#607D8B',
            toll: '#795548',
            general: '#757575'
        };
        return colors[category] || '#757575';
    };

    const numericTotal = sanitizeNumber(currentReceipt.total);
    const formattedTotal = `₹${numericTotal.toFixed(2)}`;

    // Calculate total from items
    const itemsTotal = (currentReceipt.items || []).reduce((sum, item) => {
        return sum + (sanitizeNumber(item.price) * sanitizeNumber(item.quantity));
    }, 0);

    // Check if total matches (allowing for small floating point differences)
    const isTotalMismatch = Math.abs(numericTotal - itemsTotal) > 0.1 && itemsTotal > 0;

    return (
        <ScreenWrapper>
            <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: spacing.lg }}>
                <View className="flex-row items-center" style={{ marginBottom: spacing.md }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <Body className="text-blue-600 text-lg">← Back</Body>
                    </TouchableOpacity>
                    <Title className="mb-0">Receipt Details</Title>
                </View>

                <Card style={{ marginBottom: spacing.md }}>
                    <Subtitle className="mb-3">Store Information</Subtitle>
                    <View className="mb-2">
                        <Caption>Store Name</Caption>
                        <Body className="font-semibold">{receipt.store_name || 'Not specified'}</Body>
                    </View>
                    <View className="mb-2">
                        <Caption>Date</Caption>
                        <Body className="font-semibold">{receipt.date || 'Not specified'}</Body>
                    </View>
                    <View>
                        <Caption>Payment Method</Caption>
                        <TouchableOpacity
                            onPress={() => setPaymentMethodModalVisible(true)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#f5f5f5',
                                paddingHorizontal: spacing.sm,
                                paddingVertical: spacing.xs,
                                borderRadius: spacing.sm,
                                alignSelf: 'flex-start',
                                marginTop: 4
                            }}
                        >
                            <Body className="font-semibold" style={{ marginRight: spacing.xs }}>
                                {currentReceipt.payment_method || 'Not specified'}
                            </Body>
                            <Ionicons name="pencil" size={rfs(14)} color="#757575" />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Caption>Category</Caption>
                        <TouchableOpacity
                            onPress={() => setCategoryModalVisible(true)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: getCategoryColor(currentReceipt.category) + '20',
                                paddingHorizontal: spacing.sm,
                                paddingVertical: spacing.xs,
                                borderRadius: spacing.sm,
                                alignSelf: 'flex-start',
                                marginTop: 4
                            }}
                        >
                            <Body
                                className="font-semibold"
                                style={{ color: getCategoryColor(currentReceipt.category) }}
                            >
                                {getCategoryLabel(currentReceipt.category)}
                            </Body>
                            <Ionicons
                                name="pencil"
                                size={rfs(14)}
                                color={getCategoryColor(currentReceipt.category)}
                                style={{ marginLeft: spacing.xs }}
                            />
                        </TouchableOpacity>
                    </View>
                </Card>

                {isTotalMismatch && (
                    <Card className="bg-red-50 border-red-200" style={{ marginBottom: spacing.md }}>
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="warning" size={rfs(20)} color="#D32F2F" style={{ marginRight: spacing.sm }} />
                            <Subtitle className="text-red-800 mb-0">Total Mismatch Detected</Subtitle>
                        </View>
                        <Body className="text-red-700">
                            The receipt total (₹{numericTotal.toFixed(2)}) does not match the sum of items (₹{itemsTotal.toFixed(2)}).
                        </Body>
                    </Card>
                )}

                <Card className="bg-blue-50 border-blue-200" style={{ marginBottom: spacing.md }}>
                    <View className="flex-row justify-between items-center">
                        <Subtitle className="mb-0 text-blue-800">Total Amount</Subtitle>
                        <Title className="text-2xl text-blue-600 mb-0">{formattedTotal}</Title>
                    </View>
                </Card>

                <View style={{ marginBottom: spacing.sm }}>
                    <Subtitle className="mb-3">Items ({receipt.items?.length || 0})</Subtitle>
                </View>

                {receipt.items && receipt.items.length > 0 ? (
                    receipt.items.map((item, index) => {
                        const numericPrice = sanitizeNumber(item.price);
                        const itemPrice = `₹${numericPrice.toFixed(2)}`;

                        return (
                            <Card key={index} style={{ marginBottom: spacing.sm }}>
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className="flex-1 mr-2">
                                        <Body className="font-semibold text-gray-800">{item.name || 'Unnamed Item'}</Body>
                                        <Caption>Quantity: {item.quantity || 0}</Caption>
                                    </View>
                                    <Body className="font-bold text-blue-600">{itemPrice}</Body>
                                </View>
                            </Card>
                        );
                    })
                ) : (
                    <Card>
                        <Body className="text-center text-gray-400">No items found</Body>
                    </Card>
                )}
            </ScrollView>

            {/* Category Modal */}
            <CategoryModal
                visible={categoryModalVisible}
                currentCategory={currentReceipt.category}
                onSave={handleCategoryUpdate}
                onCancel={() => setCategoryModalVisible(false)}
            />

            {/* Payment Method Modal */}
            <PaymentMethodModal
                visible={paymentMethodModalVisible}
                currentMethod={currentReceipt.payment_method}
                onSave={handlePaymentMethodUpdate}
                onCancel={() => setPaymentMethodModalVisible(false)}
            />
        </ScreenWrapper >
    );
};

export default ReceiptDetailsScreen;
