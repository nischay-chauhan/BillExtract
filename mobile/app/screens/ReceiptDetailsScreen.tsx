import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { RootStackParamList } from '../navigation/AppNavigator';

type ReceiptDetailsRouteProp = RouteProp<RootStackParamList, 'ReceiptDetails'>;
type ReceiptDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'ReceiptDetails'>;

const ReceiptDetailsScreen = () => {
    const route = useRoute<ReceiptDetailsRouteProp>();
    const navigation = useNavigation<ReceiptDetailsNavigationProp>();
    const { receipt } = route.params;

    // Format total value
    let formattedTotal = '$0.00';
    if (typeof receipt.total === 'number') {
        formattedTotal = `$${receipt.total.toFixed(2)}`;
    } else if (typeof receipt.total === 'string') {
        const numericTotal = parseFloat(receipt.total.replace(/,/g, ''));
        if (!isNaN(numericTotal)) {
            formattedTotal = `$${numericTotal.toFixed(2)}`;
        } else {
            formattedTotal = receipt.total;
        }
    }

    return (
        <ScreenWrapper>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <Body className="text-blue-600 text-lg">← Back</Body>
                    </TouchableOpacity>
                    <Title className="mb-0">Receipt Details</Title>
                </View>

                {/* Store Info */}
                <Card className="mb-4">
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
                </Card>

                {/* Total */}
                <Card className="mb-4 bg-blue-50 border-blue-200">
                    <View className="flex-row justify-between items-center">
                        <Subtitle className="mb-0 text-blue-800">Total Amount</Subtitle>
                        <Title className="text-2xl text-blue-600 mb-0">{formattedTotal}</Title>
                    </View>
                </Card>

                {/* Items */}
                <View className="mb-2">
                    <Subtitle className="mb-3">Items ({receipt.items?.length || 0})</Subtitle>
                </View>

                {receipt.items && receipt.items.length > 0 ? (
                    receipt.items.map((item, index) => {
                        // Format item price
                        let itemPrice = '$0.00';
                        if (typeof item.price === 'number') {
                            itemPrice = `$${item.price.toFixed(2)}`;
                        } else if (typeof item.price === 'string') {
                            const numericPrice = parseFloat(item.price.replace(/,/g, ''));
                            if (!isNaN(numericPrice)) {
                                itemPrice = `$${numericPrice.toFixed(2)}`;
                            } else {
                                itemPrice = item.price;
                            }
                        }

                        return (
                            <Card key={index} className="mb-3">
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
        </ScreenWrapper>
    );
};

export default ReceiptDetailsScreen;
