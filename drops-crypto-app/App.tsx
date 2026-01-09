import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';

import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import StreamersScreen from './screens/StreamersScreen';
import PrizesScreen from './screens/PrizesScreen';
import MyPrizesScreen from './screens/MyPrizesScreen';

// Для Android Studio эмулятора используйте: http://10.0.2.2:3000
// Для реального устройства или ngrok: https://ваш-ngrok-url.ngrok-free.app
const API_BASE = 'http://10.0.2.2:3000'; // Android эмулятор

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#9146FF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
      }}
    >
      <Tab.Screen
        name="Streamers"
        component={StreamersScreen}
        options={{
          tabBarLabel: 'Стримеры',
        }}
      />
      <Tab.Screen
        name="Prizes"
        component={PrizesScreen}
        options={{
          tabBarLabel: 'Призы',
        }}
      />
      <Tab.Screen
        name="MyPrizes"
        component={MyPrizesScreen}
        options={{
          tabBarLabel: 'Мои призы',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>('Auth');

  useEffect(() => {
    (async () => {
      // Check if user is authenticated
      const token = await SecureStore.getItemAsync('appToken');
      if (token) {
        setInitialRoute('Main');
      }

      // Handle deep link for OAuth callback
      const sub = Linking.addEventListener('url', async ({ url }) => {
        const parsed = Linking.parse(url);
        if (parsed.path === 'auth' && parsed.queryParams?.token) {
          const t = String(parsed.queryParams.token);
          await SecureStore.setItemAsync('appToken', t);
          // Navigation will be handled by checking token in ProfileScreen
        }
      });

      // Check initial URL
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const parsed = Linking.parse(initialUrl);
        if (parsed.path === 'auth' && parsed.queryParams?.token) {
          const t = String(parsed.queryParams.token);
          await SecureStore.setItemAsync('appToken', t);
          setInitialRoute('Main');
        }
      }

      setIsReady(true);

      return () => sub.remove();
    })();
  }, []);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
