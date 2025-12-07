import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, rfs, spacing } from '../../utils/responsive';

interface PaymentMethodModalProps {
    visible: boolean;
    currentMethod?: string;
    onSave: (method: string) => void;
    onCancel: () => void;
}

const PAYMENT_METHODS = [
    'Cash',
    'Card',
    'UPI',
    'Net Banking',
    'Wallet',
    'Other'
];

const getMethodIcon = (method: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
        'Cash': 'cash',
        'Card': 'card',
        'UPI': 'qr-code',
        'Net Banking': 'globe',
        'Wallet': 'wallet',
        'Other': 'ellipsis-horizontal'
    };
    return icons[method] || 'cash';
};

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
    visible,
    currentMethod,
    onSave,
    onCancel
}) => {
    const [selectedMethod, setSelectedMethod] = useState(currentMethod || 'Cash');

    // Reset selection when modal opens with new method
    useEffect(() => {
        if (visible && currentMethod) {
            setSelectedMethod(currentMethod);
        }
    }, [visible, currentMethod]);

    const handleSave = () => {
        onSave(selectedMethod);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
            statusBarTranslucent
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onCancel}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <LinearGradient
                        colors={['#1a1a2e', '#16213e']}
                        style={styles.modalContainer}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>Select Payment Method</Text>
                            <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={rfs(24)} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                            {PAYMENT_METHODS.map((method) => {
                                const isSelected = selectedMethod === method;

                                return (
                                    <TouchableOpacity
                                        key={method}
                                        onPress={() => setSelectedMethod(method)}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.item,
                                            isSelected && styles.itemSelected
                                        ]}
                                    >
                                        <View style={styles.itemLeft}>
                                            <View style={styles.iconContainer}>
                                                <Ionicons
                                                    name={getMethodIcon(method)}
                                                    size={rfs(20)}
                                                    color="#fff"
                                                />
                                            </View>
                                            <Text style={styles.itemLabel}>
                                                {method}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={rfs(24)}
                                                color="#4CAF50"
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                onPress={onCancel}
                                style={[styles.button, styles.cancelButton]}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSave}
                                style={[styles.button, styles.saveButton]}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={['#6366f1', '#8b5cf6']}
                                    style={styles.saveButtonGradient}
                                >
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.md
    },
    modalContainer: {
        borderRadius: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        maxHeight: hp(60),
        width: wp(90) > 400 ? 400 : wp(90),
        maxWidth: 400,
        ...Platform.select({
            android: {
                elevation: 24,
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 24,
            }
        })
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm
    },
    title: {
        fontSize: rfs(20),
        fontWeight: 'bold',
        color: '#fff'
    },
    listContainer: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.sm,
        borderRadius: spacing.sm,
        marginBottom: spacing.xs,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 2,
        borderColor: 'transparent'
    },
    itemSelected: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderColor: '#4CAF50'
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm
    },
    iconContainer: {
        width: spacing.lg,
        height: spacing.lg,
        borderRadius: spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },
    itemLabel: {
        fontSize: rfs(16),
        color: '#fff',
        fontWeight: '500'
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm
    },
    button: {
        flex: 1,
        borderRadius: spacing.sm,
        overflow: 'hidden'
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.sm
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: rfs(16),
        fontWeight: '600'
    },
    saveButton: {
        overflow: 'hidden'
    },
    saveButtonGradient: {
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: spacing.sm
    },
    saveButtonText: {
        color: '#fff',
        fontSize: rfs(16),
        fontWeight: '600'
    }
});
