import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Body, Caption } from '../ui/Typography';
import { spacing, rfs } from '../../utils/responsive';
import { ReceiptItem } from '../../api/receipts';

interface ReviewItemRowProps {
    item: ReceiptItem;
    index: number;
    onUpdate: (index: number, field: keyof ReceiptItem, value: string | number) => void;
    onRemove: (index: number) => void;
}

export const ReviewItemRow: React.FC<ReviewItemRowProps> = ({ item, index, onUpdate, onRemove }) => {
    return (
        <Card style={{ marginBottom: spacing.md }}>
            <View className="flex-row justify-between items-center" style={{ marginBottom: spacing.sm }}>
                <Body className="font-semibold text-gray-500">Item {index + 1}</Body>
                <TouchableOpacity onPress={() => onRemove(index)}>
                    <Text className="text-red-500 font-semibold">Remove</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                style={{ padding: spacing.sm, marginBottom: spacing.sm, fontSize: rfs(14) }}
                value={item.name}
                onChangeText={(value) => onUpdate(index, 'name', value)}
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
                        onChangeText={(value) => onUpdate(index, 'quantity', value)}
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
                        onChangeText={(value) => onUpdate(index, 'price', value)}
                        keyboardType="decimal-pad"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
            </View>
        </Card>
    );
};
