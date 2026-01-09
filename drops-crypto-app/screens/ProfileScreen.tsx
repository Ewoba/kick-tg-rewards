import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Для Android Studio эмулятора используйте: http://10.0.2.2:3000
const API_BASE = 'http://10.0.2.2:3000'; // Android эмулятор

interface UserData {
  id: string;
  twitchLogin: string;
  wallet: { chain: string; address: string } | null;
  participationActive: boolean;
}

export default function ProfileScreen({ navigation }: any) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [addingWallet, setAddingWallet] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const t = await SecureStore.getItemAsync('appToken');
    if (!t) {
      navigation.navigate('Auth');
      return;
    }
    setToken(t);
    await loadUserData(t);
  };

  const loadUserData = async (authToken: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUserData(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        await SecureStore.deleteItemAsync('appToken');
        navigation.navigate('Auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const addWallet = async () => {
    if (!walletAddress.trim()) {
      Alert.alert('Ошибка', 'Введите адрес кошелька');
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim())) {
      Alert.alert('Ошибка', 'Неверный формат адреса кошелька');
      return;
    }

    setAddingWallet(true);
    try {
      await axios.post(
        `${API_BASE}/me/wallet`,
        { address: walletAddress.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Успешно', 'Кошелёк добавлен');
      setWalletAddress('');
      loadUserData(token!);
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.message || 'Не удалось добавить кошелёк');
    } finally {
      setAddingWallet(false);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('appToken');
    navigation.navigate('Auth');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9146FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Профиль</Text>

        {userData && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Twitch аккаунт</Text>
              <Text style={styles.value}>{userData.twitchLogin}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Статус участия</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, userData.participationActive ? styles.active : styles.inactive]} />
                <Text style={styles.statusText}>
                  {userData.participationActive ? '✅ Активно' : '❌ Не активно'}
                </Text>
              </View>
            </View>

            {userData.wallet ? (
              <View style={styles.section}>
                <Text style={styles.label}>Кошелёк</Text>
                <Text style={styles.walletAddress}>{userData.wallet.address}</Text>
                <Text style={styles.chain}>Сеть: {userData.wallet.chain}</Text>
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.label}>Добавить кошелёк</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0x..."
                  value={walletAddress}
                  onChangeText={setWalletAddress}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.button, addingWallet && styles.buttonDisabled]}
                  onPress={addWallet}
                  disabled={addingWallet}
                >
                  {addingWallet ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Добавить</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutText}>Выйти</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  active: {
    backgroundColor: '#4CAF50',
  },
  inactive: {
    backgroundColor: '#f44336',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
  walletAddress: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 4,
  },
  chain: {
    fontSize: 12,
    color: '#999',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 20,
    padding: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
  },
});
