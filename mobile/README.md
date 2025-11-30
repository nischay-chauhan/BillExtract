# Bills Mobile App

React Native Expo mobile application for receipt scanning and bill management.

## Project Structure

```
mobile/
├── app/
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ScanScreen.tsx
│   │   ├── ReceiptsScreen.tsx
│   │   ├── AnalyticsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/       # Reusable components
│   ├── api/             # API services
│   ├── hooks/           # Custom hooks
│   └── navigation/      # Navigation configuration
│       └── AppNavigator.tsx
├── App.tsx              # Main app entry point
└── package.json
```

## Features

- **Navigation**: Bottom tab navigation with 5 screens
- **Camera Integration**: Take photos of receipts
- **Gallery Picker**: Select images from device gallery
- **TypeScript**: Full TypeScript support

## Navigation Tabs

1. **Home** - Main dashboard
2. **Scan** - Camera and gallery picker for receipt scanning
3. **Receipts** - List of scanned receipts
4. **Analytics** - Spending analytics and insights
5. **Settings** - App settings and preferences

## Dependencies

- `@react-navigation/native` - Navigation library
- `@react-navigation/stack` - Stack navigator
- `@react-navigation/bottom-tabs` - Bottom tab navigator
- `axios` - HTTP client for API calls
- `expo-image-picker` - Camera and gallery access
- `expo-camera` - Camera functionality

## Getting Started

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app:
   ```bash
   # For Android
   npm run android
   
   # For iOS (requires macOS)
   npm run ios
   
   # For web
   npm run web
   ```

## Usage

### Scan Screen Features

- **Take Photo**: Opens camera to capture receipt images
- **Pick from Gallery**: Select existing images from device gallery
- **Image Preview**: Shows selected image with proper aspect ratio
- **Permission Handling**: Requests camera and gallery permissions

The ScanScreen returns the selected image URI which can be used for:
- Uploading to backend API
- OCR processing
- Image processing and enhancement

## Development

The app is configured to work alongside the backend API. Update the API configuration in `app/api/` to connect to your backend endpoints.
