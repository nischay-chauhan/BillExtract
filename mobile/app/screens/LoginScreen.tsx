import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { login, getCurrentUser } from '../api/auth';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Login to get token
            const authResponse = await login({ email, password });

            // 2. Fetch current user details using the new token explicitly
            // This avoids race conditions with the store/interceptor
            const user = await getCurrentUser(authResponse.access_token);

            // 3. Update store with real user details and token
            console.log('Login successful, updating store...');
            await setAuth(user, authResponse.access_token);

        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert('Login Failed', error.response?.data?.detail || 'Invalid credentials');
            // Clear any partial auth state if failed
            useAuthStore.getState().logout();
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
                    <View className="items-center mb-10">
                        <View className="w-20 h-20 bg-violet-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="receipt" size={40} color="#7C3AED" />
                        </View>
                        <Text className="text-3xl font-bold text-slate-900">Welcome Back</Text>
                        <Text className="text-slate-500 mt-2">Sign in to continue</Text>
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
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            className="bg-violet-600 h-14 rounded-xl items-center justify-center mt-6 shadow-lg shadow-violet-200"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Sign In</Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-slate-500">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text className="text-violet-600 font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default LoginScreen;
