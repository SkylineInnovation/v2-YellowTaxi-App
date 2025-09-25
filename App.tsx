/**
 * YellowTaxi React Native App
 * Authentication Flow Implementation
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from './src/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { LanguageProvider } from './src/contexts/LanguageContext';
import './src/i18n';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <LanguageProvider>
        <PersistGate loading={<SplashScreen />} persistor={persistor}>
          <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <RootNavigator />
          </SafeAreaProvider>
        </PersistGate>
      </LanguageProvider>
    </Provider>
  );
}

export default App;
