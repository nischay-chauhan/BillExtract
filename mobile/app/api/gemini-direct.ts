import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export const testGeminiDirect = async (imageUri: string) => {
    try {
        console.log('[Gemini Direct] Starting direct test...');

        let base64Data = '';

        if (Platform.OS === 'web') {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } else {
            base64Data = await FileSystem.readAsStringAsync(imageUri, {
                encoding: 'base64',
            });
        }

        console.log('[Gemini Direct] Image converted to base64, length:', base64Data.length);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
      Extract all visible information from the receipt image.
      Return JSON ONLY. No explanatory text.
      Format:
      {
        "store_name": null,
        "date": null,
        "total": null,
        "items": [
          { "name": null, "quantity": null, "price": null }
        ]
      }
    `;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
            },
        };

        // 4. Generate content
        console.log('[Gemini Direct] Sending request to Gemini...');
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log('[Gemini Direct] Response received:');
        console.log(text);

        return text;

    } catch (error) {
        console.error('[Gemini Direct] Error:', error);
        throw error;
    }
};
