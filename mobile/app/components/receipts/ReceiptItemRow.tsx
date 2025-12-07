import React from 'react';
import { View } from 'react-native';
import { Card } from '../ui/Card';
import { Body, Caption } from '../ui/Typography';
import { spacing } from '../../utils/responsive';
import { ReceiptItem } from '../../api/receipts';
import { sanitizeNumber } from '../../utils/validation';

interface ReceiptItemRowProps {
    item: ReceiptItem;
}

export const ReceiptItemRow: React.FC<ReceiptItemRowProps> = ({ item }) => {
    const numericPrice = sanitizeNumber(item.price);
    const itemPrice = `₹${numericPrice.toFixed(2)}`;

    return (
        <Card style={{ marginBottom: spacing.sm }}>
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                    <Body className="font-semibold text-gray-800">{item.name || 'Unnamed Item'}</Body>
                    <Caption>Quantity: {item.quantity || 0}</Caption>
                </View>
                <Body className="font-bold text-blue-600">{itemPrice}</Body>
            </View>
        </Card>
    );
};
