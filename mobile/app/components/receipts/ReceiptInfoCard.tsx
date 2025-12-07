import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Card } from '../ui/Card';
import { Subtitle, Body, Caption } from '../ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { spacing, rfs } from '../../utils/responsive';
import { ReceiptData } from '../../api/receipts';

interface ReceiptInfoCardProps {
    receipt: ReceiptData;
    onCategoryPress: () => void;
    onPaymentPress: () => void;
}

export const ReceiptInfoCard: React.FC<ReceiptInfoCardProps> = ({ receipt, onCategoryPress, onPaymentPress }) => {
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

    const handlePaymentPress = () => {
        console.log('[ReceiptInfoCard] Payment button pressed');
        onPaymentPress();
    };

    const handleCategoryPress = () => {
        console.log('[ReceiptInfoCard] Category button pressed');
        onCategoryPress();
    };

    return (
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
            <View style={{ marginBottom: spacing.sm }}>
                <Caption>Payment Method</Caption>
                <TouchableOpacity
                    onPress={handlePaymentPress}
                    activeOpacity={0.6}
                    delayPressIn={0}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.sm,
                        borderRadius: spacing.sm,
                        alignSelf: 'flex-start',
                        marginTop: 4,
                        minHeight: 44, // Android minimum touch target
                    }}
                >
                    <Body className="font-semibold" style={{ marginRight: spacing.xs }}>
                        {receipt.payment_method || 'Not specified'}
                    </Body>
                    <Ionicons name="pencil" size={rfs(14)} color="#757575" />
                </TouchableOpacity>
            </View>
            <View>
                <Caption>Category</Caption>
                <TouchableOpacity
                    onPress={handleCategoryPress}
                    activeOpacity={0.6}
                    delayPressIn={0}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: getCategoryColor(receipt.category) + '20',
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.sm,
                        borderRadius: spacing.sm,
                        alignSelf: 'flex-start',
                        marginTop: 4,
                        minHeight: 44, // Android minimum touch target
                    }}
                >
                    <Body
                        className="font-semibold"
                        style={{ color: getCategoryColor(receipt.category) }}
                    >
                        {getCategoryLabel(receipt.category)}
                    </Body>
                    <Ionicons
                        name="pencil"
                        size={rfs(14)}
                        color={getCategoryColor(receipt.category)}
                        style={{ marginLeft: spacing.xs }}
                    />
                </TouchableOpacity>
            </View>
        </Card>
    );
};
