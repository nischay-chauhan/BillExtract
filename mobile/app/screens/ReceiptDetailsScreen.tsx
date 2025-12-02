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
import { updateReceiptCategory } from '../api/receipts';
import { ReceiptData } from '../api/receipts';
import { sanitizeNumber } from '../utils/validation';

type ReceiptDetailsRouteProp = RouteProp<RootStackParamList, 'ReceiptDetails'>;
type ReceiptDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'ReceiptDetails'>;

const ReceiptDetailsScreen = () => {
    const route = useRoute<ReceiptDetailsRouteProp>();
    const navigation = useNavigation<ReceiptDetailsNavigationProp>();
    const { receipt } = route.params;

    const [currentReceipt, setCurrentReceipt] = useState<ReceiptData>(receipt);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

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
                        <Body className="font-semibold">{receipt.payment_method || 'Not specified'}</Body>
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
        </ScreenWrapper>
    );
};

export default ReceiptDetailsScreen;
