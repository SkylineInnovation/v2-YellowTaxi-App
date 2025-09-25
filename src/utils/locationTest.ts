// Location service test utility
import { locationService } from '../services/locationService';

export const testLocationService = async (): Promise<void> => {
  console.log('🧪 Testing Location Service...');
  
  try {
    // Test 1: Check permission status
    console.log('📍 Checking location permissions...');
    const hasPermission = await locationService.hasLocationPermission();
    console.log('✅ Permission status:', hasPermission ? 'GRANTED' : 'DENIED');
    
    if (!hasPermission) {
      console.log('🔐 Requesting location permission...');
      const granted = await locationService.requestLocationPermission();
      console.log('✅ Permission request result:', granted ? 'GRANTED' : 'DENIED');
      
      if (!granted) {
        console.log('❌ Location permission denied. Cannot proceed with location tests.');
        return;
      }
    }
    
    // Test 2: Get current location
    console.log('📍 Getting current location...');
    const location = await locationService.getCurrentLocation();
    console.log('✅ Current location:', {
      latitude: location.lat,
      longitude: location.lng,
      bearing: location.bearing,
    });
    
    // Test 3: Test Places API (if available)
    console.log('🔍 Testing Places API...');
    try {
      const places = await locationService.searchPlaces('Amman, Jordan');
      console.log('✅ Places search results:', places.length, 'places found');
      if (places.length > 0) {
        console.log('📍 First place:', places[0].description);
      }
    } catch (error) {
      console.log('⚠️ Places API test failed:', error);
    }
    
    console.log('🎉 Location service tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Location service test failed:', error);
  }
};

// Auto-run test in development (disabled to prevent crashes)
// Uncomment the following lines to enable automatic testing:
/*
if (__DEV__) {
  // Delay to allow app initialization
  setTimeout(() => {
    testLocationService().catch(error => {
      console.error('Location test failed:', error);
    });
  }, 5000);
}
*/
