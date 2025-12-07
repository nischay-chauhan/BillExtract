import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Text } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { CategoryModal } from '../components/ui/CategoryModal';
import { RootStackParamList } from '../navigation/AppNavigator';
import { spacing, rfs } from '../utils/responsive';
import { updateReceiptCategory, updateReceipt, deleteReceipt } from '../api/receipts';
import { ReceiptData } from '../api/receipts';
import { sanitizeNumber } from '../utils/validation';
import { PaymentMethodModal } from '../components/ui/PaymentMethodModal';
import { ReceiptInfoCard } from '../components/receipts/ReceiptInfoCard';
import { ReceiptItemRow } from '../components/receipts/ReceiptItemRow';

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
    const [isDeleting, setIsDeleting] = useState(false);

    const handlePaymentMethodUpdate = async (newMethod: string) => {
        try {
            setIsUpdating(true);
            const receiptId = currentReceipt._id || currentReceipt.id;
            if (!receiptId) throw new Error('No receipt ID');

            await updateReceipt(receiptId, { payment_method: newMethod });
            setCurrentReceipt({ ...currentReceipt, payment_method: newMethod });
            setPaymentMethodModalVisible(false);
        } catch (error) {
            console.error('Failed to update payment method:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update payment method',
                position: 'bottom',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCategoryUpdate = async (newCategory: string) => {
        try {
            setIsUpdating(true);
            const receiptId = currentReceipt._id || currentReceipt.id;
            if (!receiptId) throw new Error('No receipt ID');

            await updateReceiptCategory(receiptId, newCategory);
            setCurrentReceipt({ ...currentReceipt, category: newCategory });
            setCategoryModalVisible(false);
        } catch (error) {
            console.error('Failed to update category:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update category',
                position: 'bottom',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = () => {
        const receiptId = currentReceipt._id || currentReceipt.id;
        if (!receiptId) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No receipt ID found',
                position: 'bottom',
            });
            return;
        }

        Alert.alert(
            'Delete Receipt',
            'Are you sure you want to delete this receipt? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsDeleting(true);
                            await deleteReceipt(receiptId);

                            Toast.show({
                                type: 'success',
                                text1: 'Deleted',
                                text2: 'Receipt deleted successfully',
                                position: 'bottom',
                            });

                            // Navigate back to receipts list
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
                            console.error('Failed to delete receipt:', error);
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: error.message || 'Failed to delete receipt',
                                position: 'bottom',
                            });
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    const openCategoryModal = () => {
        console.log('[ReceiptDetailsScreen] Opening category modal');
        setCategoryModalVisible(true);
    };

    const openPaymentModal = () => {
        console.log('[ReceiptDetailsScreen] Opening payment modal');
        setPaymentMethodModalVisible(true);
    };

    const numericTotal = sanitizeNumber(currentReceipt.total);
    const formattedTotal = `₹${numericTotal.toFixed(2)}`;

    const itemsTotal = (currentReceipt.items || []).reduce((sum, item) => {
        return sum + (sanitizeNumber(item.price) * sanitizeNumber(item.quantity));
    }, 0);

    const isTotalMismatch = Math.abs(numericTotal - itemsTotal) > 0.1 && itemsTotal > 0;

    return (
        <>
            <ScreenWrapper>
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: spacing.xl * 3 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header with back and delete buttons */}
                    <View className="flex-row items-center justify-between" style={{ marginBottom: spacing.md }}>
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                                <Body className="text-blue-600 text-lg">← Back</Body>
                            </TouchableOpacity>
                            <Title className="mb-0">Receipt Details</Title>
                        </View>
                        <TouchableOpacity
                            onPress={handleDelete}
                            disabled={isDeleting}
                            style={{ padding: spacing.xs }}
                            activeOpacity={0.7}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <Ionicons name="trash-outline" size={rfs(24)} color="#EF4444" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <ReceiptInfoCard
                        receipt={currentReceipt}
                        onCategoryPress={openCategoryModal}
                        onPaymentPress={openPaymentModal}
                    />

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
                        receipt.items.map((item, index) => (
                            <ReceiptItemRow key={index} item={item} />
                        ))
                    ) : (
                        <Card>
                            <Body className="text-center text-gray-400">No items found</Body>
                        </Card>
                    )}

                    {/* Delete Button at bottom */}
                    <TouchableOpacity
                        onPress={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-500 rounded-xl items-center"
                        style={{
                            marginTop: spacing.xl,
                            paddingVertical: spacing.md,
                            opacity: isDeleting ? 0.5 : 1
                        }}
                        activeOpacity={0.7}
                    >
                        {isDeleting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View className="flex-row items-center">
                                <Ionicons name="trash-outline" size={rfs(20)} color="white" style={{ marginRight: spacing.xs }} />
                                <Text className="text-white text-lg font-semibold">Delete Receipt</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </ScreenWrapper>

            <CategoryModal
                visible={categoryModalVisible}
                currentCategory={currentReceipt.category}
                onSave={handleCategoryUpdate}
                onCancel={() => {
                    console.log('[ReceiptDetailsScreen] Closing category modal');
                    setCategoryModalVisible(false);
                }}
            />

            <PaymentMethodModal
                visible={paymentMethodModalVisible}
                currentMethod={currentReceipt.payment_method}
                onSave={handlePaymentMethodUpdate}
                onCancel={() => {
                    console.log('[ReceiptDetailsScreen] Closing payment modal');
                    setPaymentMethodModalVisible(false);
                }}
            />
        </>
    );
};

export default ReceiptDetailsScreen;
