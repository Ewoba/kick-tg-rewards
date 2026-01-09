import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as Linking from 'expo-linking';

// Для Android Studio эмулятора используйте: http://10.0.2.2:3000
const API_BASE = 'http://10.0.2.2:3000'; // Android эмулятор

export default function AuthScreen({ navigation }: any) {
  const connectTwitch = async () => {
    await Linking.openURL(`${API_BASE}/auth/twitch/start`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Drops криптой</Text>
        <Text style={styles.subtitle}>Подключите Twitch для участия в дропах</Text>
        
        <TouchableOpacity style={styles.twitchButton} onPress={connectTwitch}>
          <Text style={styles.twitchButtonText}>Привязать Twitch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  twitchButton: {
    backgroundColor: '#9146FF',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  twitchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
