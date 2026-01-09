import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://10.0.2.2:3000'; // Android эмулятор

interface PrizeClaim {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  claimedAt: string;
  processedAt?: string;
  completedAt?: string;
  txHash?: string;
  txError?: string;
  prize: {
    id: string;
    title: string;
    description?: string;
    tokenAmount?: string;
    tokenSymbol?: string;
    streamer: {
      displayName: string;
      twitchLogin: string;
    };
  };
}

export default function MyPrizesScreen({ navigation }: any) {
  const [claims, setClaims] = useState<PrizeClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadClaims();
  }, [filter]);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('appToken');
      if (!token) {
        navigation.navigate('Auth');
        return;
      }

      const url = filter
        ? `${API_BASE}/prizes/my/claims?status=${filter}`
        : `${API_BASE}/prizes/my/claims`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(response.data);
    } catch (error: any) {
      console.error('Error loading claims:', error);
      if (error.response?.status === 401) {
        navigation.navigate('Auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '#4CAF50';
      case 'FAILED':
        return '#f44336';
      case 'PROCESSING':
        return '#2196F3';
      case 'PENDING':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'Успешно';
      case 'FAILED':
        return 'Ошибка';
      case 'PROCESSING':
        return 'Обрабатывается';
      case 'PENDING':
        return 'Ожидает';
      default:
        return status;
    }
  };

  const renderClaim = ({ item }: { item: PrizeClaim }) => (
    <View style={styles.claimCard}>
      <View style={styles.claimHeader}>
        <Text style={styles.claimTitle}>{item.prize.title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      {item.prize.description && (
        <Text style={styles.claimDescription}>{item.prize.description}</Text>
      )}

      <Text style={styles.claimStreamer}>
        От: {item.prize.streamer.displayName}
      </Text>

      {item.prize.tokenAmount && (
        <Text style={styles.claimAmount}>
          {item.prize.tokenAmount} {item.prize.tokenSymbol || 'токенов'}
        </Text>
      )}

      {item.txHash && (
        <Text style={styles.claimTx}>
          TX: {item.txHash.substring(0, 20)}...
        </Text>
      )}

      {item.txError && (
        <Text style={styles.claimError}>Ошибка: {item.txError}</Text>
      )}

      <Text style={styles.claimDate}>
        Получен: {new Date(item.claimedAt).toLocaleDateString('ru-RU')}
      </Text>
    </View>
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterButton, !filter && styles.filterButtonActive]}
          onPress={() => setFilter(undefined)}
        >
          <Text
            style={[
              styles.filterText,
              !filter && styles.filterTextActive,
            ]}
          >
            Все
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'PENDING' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('PENDING')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'PENDING' && styles.filterTextActive,
            ]}
          >
            Ожидает
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'PROCESSING' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('PROCESSING')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'PROCESSING' && styles.filterTextActive,
            ]}
          >
            Обрабатывается
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'SUCCESS' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('SUCCESS')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'SUCCESS' && styles.filterTextActive,
            ]}
          >
            Успешно
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'FAILED' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('FAILED')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'FAILED' && styles.filterTextActive,
            ]}
          >
            Ошибка
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <FlatList
        data={claims}
        renderItem={renderClaim}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Нет призов</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={loadClaims}
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
  filters: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#9146FF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  claimCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  claimTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  claimDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  claimStreamer: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  claimAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9146FF',
    marginBottom: 8,
  },
  claimTx: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 4,
  },
  claimError: {
    fontSize: 12,
    color: '#f44336',
    marginBottom: 4,
  },
  claimDate: {
    fontSize: 12,
    color: '#999',
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
