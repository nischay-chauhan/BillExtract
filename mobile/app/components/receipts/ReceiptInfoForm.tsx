import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Subtitle, Body } from '../ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { spacing, rfs } from '../../utils/responsive';

interface ReceiptInfoFormProps {
    storeName: string;
    setStoreName: (text: string) => void;
    date: string;
    setDate: (text: string) => void;
    total: string;
    setTotal: (text: string) => void;
    category: string;
    paymentMethod: string;
    onCategoryPress: () => void;
    onPaymentPress: () => void;
}

export const ReceiptInfoForm: React.FC<ReceiptInfoFormProps> = ({
    storeName,
    setStoreName,
    date,
    setDate,
    total,
    setTotal,
    category,
    paymentMethod,
    onCategoryPress,
    onPaymentPress
}) => {
    const handleCategoryPress = () => {
        console.log('[ReceiptInfoForm] Category button pressed');
        onCategoryPress();
    };

    const handlePaymentPress = () => {
        console.log('[ReceiptInfoForm] Payment button pressed');
        onPaymentPress();
    };

    return (
        <>
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
                        onPress={handleCategoryPress}
                        activeOpacity={0.6}
                        delayPressIn={0}
                        className="bg-white border border-gray-200 rounded-xl flex-row items-center justify-between"
                        style={{ padding: spacing.sm, minHeight: 48 }}
                    >
                        <Body className="text-gray-900 capitalize">{category.replace('_', ' ')}</Body>
                        <Ionicons name="chevron-down" size={rfs(16)} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                    <Subtitle style={{ marginBottom: spacing.sm }}>Payment</Subtitle>
                    <TouchableOpacity
                        onPress={handlePaymentPress}
                        activeOpacity={0.6}
                        delayPressIn={0}
                        className="bg-white border border-gray-200 rounded-xl flex-row items-center justify-between"
                        style={{ padding: spacing.sm, minHeight: 48 }}
                    >
                        <Body className="text-gray-900">{paymentMethod}</Body>
                        <Ionicons name="chevron-down" size={rfs(16)} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};
