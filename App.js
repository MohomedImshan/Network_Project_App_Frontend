import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

// Firebase
import messaging from '@react-native-firebase/messaging';

// Screens
import LoginScreen from './src/screens/Auth/LoginScreen.js';
import SignupScreen from './src/screens/Auth/SignupScreen.js';
import HomeScreen from './src/screens/HomeScreen.js';
import NetworkDetailsScreen from './src/screens/NetworkDetailsScree.js';
import ConnectedDevicesScreen from './src/screens/ConnectedDevicesScreen.js';
import WifiScreen from './src/screens/wifiscreen.js';
import UserProfileScreen from './src/screens/User/UserProfile.js';
import VerificationScreen from './src/screens/User/VerificationScreen.js';
import EditProfileScreen from './src/screens/User/EditProfileScreen.js';
import NewPasswordScreen from './src/screens/User/NewPasswordScreen.js';
import DeviceHistoryScreen from './src/screens/DeviceHistoryScreen.js';
import NetworkUsage from './src/screens/NetworkUsage.js';
import SiteVisits from './src/screens/Sitevisited.js';
const Stack = createNativeStackNavigator();

function App() {
  useEffect(() => {
    // Initialize FCM
    const initFCM = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        console.log('Notification permission status:', authStatus);

        const fcmToken = await messaging().getToken();
        console.log('🔥 FCM Token:', fcmToken);
        // TODO: Send this token to your backend if needed
      } catch (error) {
        console.log('FCM Error:', error);
      }
    };

    initFCM();

    // Foreground notification
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title ?? 'Notification',
        remoteMessage.notification?.body ?? ''
      );
    });

    // Background notification (app opened from background)
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Background notification tapped:', remoteMessage.notification);
      // Navigate to screen if needed
      // e.g., navigation.navigate('Home');
    });

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Quit-state notification:', remoteMessage.notification);
          // Navigate if needed
        }
      });

    // Token refresh listener
    const unsubscribeToken = messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      // Update backend if needed
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
      unsubscribeToken();
    };
  }, []);

  enableScreens();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NetworkDetails" component={NetworkDetailsScreen} />
        <Stack.Screen name="Devices" component={ConnectedDevicesScreen} />
        <Stack.Screen name="Wifi" component={WifiScreen} />
        <Stack.Screen name="DeviceHistory" component={DeviceHistoryScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="changePassword" component={NewPasswordScreen} />
        <Stack.Screen name="NetworkUsage" component={NetworkUsage} />
        <Stack.Screen name="SiteVisits" component={SiteVisits} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
