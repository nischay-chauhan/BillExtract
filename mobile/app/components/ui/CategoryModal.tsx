import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../../types';
import { wp, hp, rfs, spacing } from '../../utils/responsive';

interface CategoryModalProps {
    visible: boolean;
    currentCategory?: string;
    onSave: (category: string) => void;
    onCancel: () => void;
}

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
        grocery: 'cart',
        restaurant: 'restaurant',
        petrol: 'car',
        pharmacy: 'medical',
        electronics: 'phone-portrait',
        food_delivery: 'bicycle',
        parking: 'car',
        toll: 'cash',
        general: 'receipt'
    };
    return icons[category] || 'receipt';
};

const getCategoryLabel = (category: string): string => {
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

const getCategoryColor = (category: string): string => {
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

export const CategoryModal: React.FC<CategoryModalProps> = ({
    visible,
    currentCategory,
    onSave,
    onCancel
}) => {
    const [selectedCategory, setSelectedCategory] = useState(currentCategory || 'general');

    const handleSave = () => {
        onSave(selectedCategory);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <LinearGradient
                    colors={['#1a1a2e', '#16213e']}
                    style={styles.modalContainer}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Category</Text>
                        <TouchableOpacity onPress={onCancel}>
                            <Ionicons name="close" size={rfs(24)} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.categoriesList}>
                        {CATEGORIES.map((category) => {
                            const isSelected = selectedCategory === category;
                            const color = getCategoryColor(category);

                            return (
                                <Pressable
                                    key={category}
                                    onPress={() => setSelectedCategory(category)}
                                    style={[
                                        styles.categoryItem,
                                        isSelected && {
                                            backgroundColor: color + '20',
                                            borderColor: color
                                        }
                                    ]}
                                >
                                    <View style={styles.categoryLeft}>
                                        <View
                                            style={[
                                                styles.iconContainer,
                                                { backgroundColor: color }
                                            ]}
                                        >
                                            <Ionicons
                                                name={getCategoryIcon(category)}
                                                size={rfs(20)}
                                                color="#fff"
                                            />
                                        </View>
                                        <Text style={styles.categoryLabel}>
                                            {getCategoryLabel(category)}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={rfs(24)}
                                            color={color}
                                        />
                                    )}
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={onCancel}
                            style={[styles.button, styles.cancelButton]}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSave}
                            style={[styles.button, styles.saveButton]}
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
            </View>
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
        maxHeight: hp(70),
        width: '100%',
        maxWidth: 400
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
    categoriesList: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm
    },
    categoryItem: {
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
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm
    },
    iconContainer: {
        width: spacing.lg,
        height: spacing.lg,
        borderRadius: spacing.sm,
        justifyContent: 'center',
        alignItems: 'center'
    },
    categoryLabel: {
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
