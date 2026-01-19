/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/Auth/LoginScreen.js';
import SignupScreen from './src/screens/Auth/SignupScreen.js';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import HomeScreen from './src/screens/HomeScreen.js';
import NetworkDetailsScreen from './src/screens/NetworkDetailsScree.js';
import ConnectedDevicesScreen from './src/screens/ConnectedDevicesScreen.js';
import WifiScreen from './src/screens/wifiscreen.js';

const Stack = createNativeStackNavigator();

function App() {
  enableScreens();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Login' component={LoginScreen}/>
        <Stack.Screen name='Signup' component={SignupScreen}/>
        <Stack.Screen name='Home' component={HomeScreen}/>
        <Stack.Screen name='NetworkDetails' component={NetworkDetailsScreen}/>
        <Stack.Screen name='Devices' component={ConnectedDevicesScreen}/>
        <Stack.Screen name='Wifi' component={WifiScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
