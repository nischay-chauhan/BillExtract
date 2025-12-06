import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { register } from '../api/auth';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await register({ email, password });
            Alert.alert(
                'Success',
                'Account created successfully! Please sign in.',
                [{
                    text: 'OK',
                    onPress: () => navigation.navigate('Login')
                }]
            );
        } catch (error: any) {
            console.error('Registration error:', error);
            Alert.alert('Registration Failed', error.response?.data?.detail || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="absolute top-4 left-0 z-10 p-2 rounded-full bg-slate-100"
                    >
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>

                    <View className="items-center mb-10 mt-16">
                        <View className="w-20 h-20 bg-violet-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="person-add" size={40} color="#7C3AED" />
                        </View>
                        <Text className="text-3xl font-bold text-slate-900">Create Account</Text>
                        <Text className="text-slate-500 mt-2">Sign up to start tracking bills</Text>
                    </View>

                    <View className="space-y-4">
                        <View>
                            <Text className="text-slate-700 font-medium mb-2 ml-1">Email</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                                <Ionicons name="mail-outline" size={20} color="#94A3B8" />
                                <TextInput
                                    className="flex-1 ml-3 text-slate-900 h-full"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-slate-700 font-medium mb-2 ml-1">Password</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
                                <TextInput
                                    className="flex-1 ml-3 text-slate-900 h-full"
                                    placeholder="Create a password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View>
                            <Text className="text-slate-700 font-medium mb-2 ml-1">Confirm Password</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
                                <TextInput
                                    className="flex-1 ml-3 text-slate-900 h-full"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={isLoading}
                            className="bg-violet-600 h-14 rounded-xl items-center justify-center mt-6 shadow-lg shadow-violet-200"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-slate-500">Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text className="text-violet-600 font-bold">Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default RegisterScreen;
