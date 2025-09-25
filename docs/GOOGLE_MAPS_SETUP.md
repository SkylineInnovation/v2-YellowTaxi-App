# Google Maps Setup Guide for YellowTaxi App

## Overview
This guide explains how to set up Google Maps integration for the YellowTaxi ride-booking app. The app uses Google Maps for location services, route visualization, and Places Autocomplete.

## Prerequisites
- Google Cloud Platform account
- Google Maps API key with appropriate permissions
- React Native development environment set up

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable billing for the project (required for Maps APIs)

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud project:

### Required APIs:
- **Maps SDK for Android** - For Android map display
- **Maps SDK for iOS** - For iOS map display  
- **Places API** - For location search and autocomplete
- **Directions API** - For route calculation between locations
- **Geocoding API** - For converting addresses to coordinates

### How to Enable:
1. Go to "APIs & Services" > "Library"
2. Search for each API and click "Enable"
3. Wait for all APIs to be enabled

## Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. **Important**: Restrict the API key for security

### API Key Restrictions:
1. Click on your API key to edit
2. Under "Application restrictions":
   - For development: Choose "None" 
   - For production: Choose "Android apps" and add your package name
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose the APIs you enabled above

## Step 4: Configure Android App

### Update AndroidManifest.xml
The manifest is already configured with placeholder. Replace the API key:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_ACTUAL_API_KEY_HERE" />
```

### Location Permissions
Already added to AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## Step 5: Configure iOS App (If needed)

### Add API Key to Info.plist
```xml
<key>GMSApiKey</key>
<string>YOUR_ACTUAL_API_KEY_HERE</string>
```

### Location Permissions in Info.plist
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show your position on the map and find nearby drivers.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to provide ride services and track your trip.</string>
```

## Step 6: Environment Configuration

1. Copy `.env.example` to `.env`
2. Add your Google Maps API key:
```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## Step 7: Test the Integration

### Build and Run
```bash
# Clean and rebuild
npm run android
# or
npm run ios
```

### Test Features
1. **Map Display**: Maps should load without errors
2. **Location Search**: Places autocomplete should work in booking screen
3. **Current Location**: App should request and show user location
4. **Route Display**: Routes should appear between pickup and destination

## Troubleshooting

### Common Issues

#### 1. "Map not available" Error
- Check if API key is correctly set in AndroidManifest.xml
- Verify Maps SDK for Android is enabled
- Check if billing is enabled on Google Cloud project

#### 2. Places Autocomplete Not Working
- Verify Places API is enabled
- Check API key restrictions
- Ensure internet connectivity

#### 3. Location Permission Denied
- Check if location permissions are granted in device settings
- Verify permissions are declared in AndroidManifest.xml
- Test on physical device (location may not work in emulator)

#### 4. Routes Not Displaying
- Check if Directions API is enabled
- Verify API key has access to Directions API
- Check network connectivity

### Debug Steps
1. Check Metro bundler logs for errors
2. Check Android logcat: `adb logcat | grep -i maps`
3. Verify API key in Google Cloud Console usage metrics
4. Test API key with direct HTTP requests

## API Usage and Billing

### Free Tier Limits (Monthly)
- Maps SDK: 28,000 loads
- Places API: $200 credit (≈ 17,000 requests)
- Directions API: $200 credit (≈ 40,000 requests)

### Cost Optimization Tips
1. Cache location results when possible
2. Use session tokens for Places Autocomplete
3. Implement request debouncing
4. Set appropriate zoom levels to reduce tile requests

## Security Best Practices

### API Key Security
1. **Never commit API keys to version control**
2. Use environment variables for API keys
3. Restrict API keys to specific APIs and applications
4. Rotate API keys periodically
5. Monitor API usage in Google Cloud Console

### Production Configuration
1. Set up separate API keys for development and production
2. Use Android app signing key fingerprint restrictions
3. Implement server-side proxy for sensitive API calls
4. Monitor and set up billing alerts

## Support and Resources

### Documentation
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)

### Getting Help
- Google Maps Platform Support
- React Native Maps GitHub Issues
- Stack Overflow with tags: `google-maps`, `react-native-maps`

---

**Note**: This setup is required for the ride-booking functionality to work properly. Without proper Google Maps configuration, the app will show fallback components instead of interactive maps.
