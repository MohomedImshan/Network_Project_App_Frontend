import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import NetworkDetailsScreen from '../screens/NetworkDetailsScree';
import ConnectedDevicesScreen from '../screens/ConnectedDevicesScreen';
import NetworkUsageScreen from '../screens/NetworkUsage';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="NetworkDetails" component={NetworkDetailsScreen} />
      <Stack.Screen name="Devices" component={ConnectedDevicesScreen} />
      <Stack.Screen name="NetworkUsage" component={NetworkUsageScreen} />
    </Stack.Navigator>
  );
}
