import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Title, Body } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { ScanningModal } from '../components/ui/ScanningModal';

import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { uploadReceipt } from '../api/receipts';
import { testGeminiDirect } from '../api/gemini-direct';
import { hp, wp, spacing, isSmallDevice } from '../utils/responsive';

type ScanScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ScanScreen = () => {
  const navigation = useNavigation<ScanScreenNavigationProp>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);




  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const pickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Gallery permission is required to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select or take a photo first.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      console.log('[ScanScreen] Uploading image:', selectedImage);
      const response = await uploadReceipt(selectedImage);

      console.log('[ScanScreen] Upload successful, navigating to ReviewReceipt');

      navigation.navigate('ReviewReceipt', {
        receiptData: response.extracted,
        receiptId: response.receipt_id,
        confidence: response.confidence,
        status: response.status,
      });

      setSelectedImage(null);
    } catch (error: any) {
      console.error('[ScanScreen] Upload failed:', error);
      const errorMessage = error.message || 'Failed to upload receipt';
      setUploadError(errorMessage);
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}>
        <Title style={{ marginBottom: spacing.md }}>Scan Receipt</Title>

        {selectedImage ? (
          <Card className="p-0 overflow-hidden" style={{ marginBottom: spacing.md, height: hp(300) }}>
            <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="contain" />
          </Card>
        ) : (
          <View
            className="bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 items-center justify-center"
            style={{ height: hp(300), marginBottom: spacing.md }}
          >
            <Body className="text-gray-400">No image selected</Body>
          </View>
        )}

        <View style={{ gap: spacing.md }}>
          <TouchableOpacity
            className={`bg-blue-600 rounded-xl items-center ${uploading ? 'opacity-50' : ''}`}
            style={{ padding: spacing.md }}
            onPress={takePhoto}
            disabled={uploading}
          >
            <Text className="text-white text-lg font-semibold">Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-green-600 rounded-xl items-center ${uploading ? 'opacity-50' : ''}`}
            style={{ padding: spacing.md }}
            onPress={pickFromGallery}
            disabled={uploading}
          >
            <Text className="text-white text-lg font-semibold">Pick from Gallery</Text>
          </TouchableOpacity>

          {selectedImage && (
            <TouchableOpacity
              className={`bg-orange-500 rounded-xl items-center ${uploading ? 'opacity-50' : ''}`}
              style={{ padding: spacing.md }}
              onPress={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">Upload & Process</Text>
              )}
            </TouchableOpacity>
          )}


        </View>

        {uploadError && (
          <Text className="text-red-500 text-center mt-4">{uploadError}</Text>
        )}
      </ScrollView>

      <ScanningModal visible={uploading} status="Analyzing Receipt..." />
    </ScreenWrapper>
  );
};

export default ScanScreen;

