# 🚕 YellowTaxi Mobile App

A professional React Native mobile application for the YellowTaxi ride-hailing service, featuring Firebase phone authentication and consistent branding with the web application.

## 📱 Features

- **🔐 Firebase Phone Authentication**: Secure phone number verification with OTP
- **🎨 Professional Branding**: Consistent YellowTaxi logo across all screens
- **📱 Cross-Platform**: Supports both Android and iOS
- **🔥 Real-time Database**: Firestore integration for user data
- **🚀 Modern UI**: Clean, responsive design with TypeScript
- **📊 State Management**: Redux Toolkit for predictable state updates

## 🏗️ Tech Stack

- **Framework**: React Native 0.76.5
- **Language**: TypeScript
- **Authentication**: Firebase Auth (Phone)
- **Database**: Cloud Firestore
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 6
- **UI Components**: Custom component library
- **Graphics**: React Native SVG for logo rendering

## 🚀 Getting Started

> **Note**: Make sure you have completed the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Prerequisites

1. **Node.js**: Version 18 or higher
2. **React Native CLI**: `npm install -g @react-native-community/cli`
3. **Android Studio**: For Android development
4. **Xcode**: For iOS development (macOS only)
5. **Firebase Project**: Set up with Authentication and Firestore enabled

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SkylineInnovation/v2-YellowTaxi-App.git
   cd v2-YellowTaxi-App
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Firebase Configuration**:
   - Place your `google-services.json` in `android/app/`
   - Place your `GoogleService-Info.plist` in `ios/YellowTaxiApp/`

## 🏃‍♂️ Running the App

### Start Metro Server

```bash
npm start
```

### Build and Run

#### Android
```bash
npx react-native run-android
```

#### iOS
```bash
npx react-native run-ios
```

## 🔐 Authentication Flow

The app implements Firebase phone authentication with the following flow:

1. **Phone Login**: Enter phone number (supports US and international formats)
2. **OTP Verification**: Enter 6-digit verification code sent via SMS
3. **User Creation**: Automatic user document creation in Firestore
4. **Welcome Screen**: Personalized welcome with user information

### Test Credentials

For development and testing:
- **Phone Number**: `3333333333` (US format)
- **OTP Code**: `123456`

## 🎨 App Screens

### Authentication Screens
- **📱 Phone Login**: Professional YellowTaxi branding with phone input
- **🔐 OTP Verification**: Code verification with resend functionality
- **🎉 Welcome Screen**: Post-authentication welcome with user info

### Core Screens
- **🚀 Splash Screen**: App launch with YellowTaxi logo
- **🏠 Main App**: Placeholder for future ride-booking features

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Core UI components (Button, Input, Logo, etc.)
│   └── forms/          # Form-specific components
├── screens/            # App screens
│   ├── auth/           # Authentication screens
│   └── main/           # Main app screens
├── navigation/         # Navigation configuration
├── services/           # External services (Firebase, API)
├── store/              # Redux store and slices
├── theme/              # Design system (colors, typography, spacing)
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔧 Development

### Hot Reload
The app supports Fast Refresh for instant updates during development:
- **Android**: Press <kbd>R</kbd> twice or <kbd>Ctrl</kbd> + <kbd>M</kbd> for dev menu
- **iOS**: Press <kbd>R</kbd> in simulator or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> for dev menu

### Key Components

#### Logo Component
```typescript
import { Logo } from '../components/ui';

// Default usage
<Logo />

// Custom size and color
<Logo size={120} color="#FFFFFF" />
```

#### Authentication Components
- `PhoneInput`: International phone number input with validation
- `OTPInput`: 6-digit OTP verification input
- `Button`: Customizable button with loading states

## 🧪 Testing

### Manual Testing Flow
1. Launch app → Splash screen with YellowTaxi logo
2. Enter phone: `3333333333`
3. Enter OTP: `123456`
4. Verify welcome screen displays user information
5. Test sign out functionality

### Firebase Test Configuration
- Uses Firebase Auth test phone numbers
- Firestore rules configured for development
- Real-time user document creation and updates

## 🚀 Deployment

### Android
1. Generate signed APK:
   ```bash
   cd android && ./gradlew assembleRelease
   ```

2. Upload to Google Play Console

### iOS
1. Archive in Xcode
2. Upload to App Store Connect

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- [`FIREBASE_AUTHENTICATION_COMPLETE.md`](docs/FIREBASE_AUTHENTICATION_COMPLETE.md) - Firebase setup and implementation
- [`LOGO_IMPLEMENTATION.md`](docs/LOGO_IMPLEMENTATION.md) - Logo integration and branding
- [`FIRESTORE_SERVERTIMESTAMP_FIX.md`](docs/FIRESTORE_SERVERTIMESTAMP_FIX.md) - Firestore timestamp handling
- [`PHONE_VALIDATION_FIX.md`](docs/PHONE_VALIDATION_FIX.md) - Phone number validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Build Failures:**
- Clean and rebuild: `npx react-native clean && npm install`
- Reset Metro cache: `npx react-native start --reset-cache`

**Firebase Issues:**
- Verify `google-services.json` and `GoogleService-Info.plist` are correctly placed
- Check Firebase project configuration and enabled services

**Logo Display Issues:**
- Ensure `react-native-svg` is properly installed
- Run `cd ios && pod install` after installing SVG dependencies

### Getting Help

- Check the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting)
- Review Firebase documentation for authentication setup
- Open an issue in the repository for project-specific problems

## 🔗 Links

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Navigation Documentation](https://reactnavigation.org/)

---

**🚕 Built with ❤️ for the YellowTaxi platform**
