import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Для Android Studio эмулятора используйте: http://10.0.2.2:3000
const API_BASE = 'http://10.0.2.2:3000'; // Android эмулятор

interface Prize {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  tokenAmount?: string;
  chain: string;
  isActive: boolean;
  streamer?: {
    displayName: string;
    twitchLogin: string;
  };
}

export default function PrizesScreen({ navigation }: any) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('appToken');
      const response = await axios.get(`${API_BASE}/prizes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPrizes(response.data);
    } catch (error) {
      console.error('Error loading prizes:', error);
      // Моковые данные для демо
      setPrizes([
        {
          id: '1',
          title: '100 токенов',
          description: 'За просмотр стрима',
          tokenAmount: '100',
          chain: 'base',
          isActive: true,
          streamer: {
            displayName: 'Streamer One',
            twitchLogin: 'streamer1',
          },
        },
        {
          id: '2',
          title: 'Эксклюзивный NFT',
          description: 'Уникальный NFT от стримера',
          chain: 'base',
          isActive: true,
          streamer: {
            displayName: 'Streamer Two',
            twitchLogin: 'streamer2',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const claimPrize = async (prizeId: string) => {
    try {
      const token = await SecureStore.getItemAsync('appToken');
      if (!token) {
        Alert.alert('Ошибка', 'Необходима авторизация');
        return;
      }

      await axios.post(
        `${API_BASE}/prizes/${prizeId}/claim`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Успешно', 'Приз получен!');
      loadPrizes();
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.message || 'Не удалось получить приз');
    }
  };

  const renderPrize = ({ item }: { item: Prize }) => (
    <TouchableOpacity style={styles.prizeCard}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.prizeImage} />
      )}
      <View style={styles.prizeContent}>
        <Text style={styles.prizeTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.prizeDescription}>{item.description}</Text>
        )}
        {item.streamer && (
          <Text style={styles.prizeStreamer}>От: {item.streamer.displayName}</Text>
        )}
        {item.tokenAmount && (
          <Text style={styles.prizeAmount}>{item.tokenAmount} токенов</Text>
        )}
        {item.isActive && (
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => claimPrize(item.id)}
          >
            <Text style={styles.claimButtonText}>Получить приз</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9146FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={prizes}
        renderItem={renderPrize}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Нет доступных призов</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  prizeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prizeImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
  },
  prizeContent: {
    padding: 16,
  },
  prizeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  prizeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  prizeStreamer: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  prizeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9146FF',
    marginBottom: 12,
  },
  claimButton: {
    backgroundColor: '#9146FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
