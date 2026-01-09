import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Для Android Studio эмулятора используйте: http://10.0.2.2:3000
const API_BASE = 'http://10.0.2.2:3000'; // Android эмулятор

interface Streamer {
  id: string;
  twitchLogin: string;
  displayName: string;
  avatarUrl?: string;
  isActive: boolean;
  isFollowing?: boolean;
}

export default function StreamersScreen({ navigation }: any) {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreamers();
  }, []);

  const [following, setFollowing] = useState<Set<string>>(new Set());

  const loadStreamers = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('appToken');
      const response = await axios.get(`${API_BASE}/streamers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStreamers(response.data || []);
      
      // Update following set
      if (response.data) {
        const followingSet = new Set<string>();
        response.data.forEach((s: Streamer) => {
          if (s.isFollowing) {
            followingSet.add(s.id);
          }
        });
        setFollowing(followingSet);
      }
    } catch (error) {
      console.error('Error loading streamers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (streamerId: string) => {
    try {
      const token = await SecureStore.getItemAsync('appToken');
      if (!token) {
        navigation.navigate('Auth');
        return;
      }

      const isCurrentlyFollowing = following.has(streamerId);

      if (isCurrentlyFollowing) {
        await axios.delete(`${API_BASE}/me/streamers/${streamerId}/follow`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowing((prev) => {
          const newSet = new Set(prev);
          newSet.delete(streamerId);
          return newSet;
        });
        setStreamers((prev) =>
          prev.map((s) =>
            s.id === streamerId ? { ...s, isFollowing: false } : s
          )
        );
      } else {
        await axios.post(
          `${API_BASE}/me/streamers/${streamerId}/follow`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFollowing((prev) => new Set(prev).add(streamerId));
        setStreamers((prev) =>
          prev.map((s) =>
            s.id === streamerId ? { ...s, isFollowing: true } : s
          )
        );
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      if (error.response?.status === 401) {
        navigation.navigate('Auth');
      }
    }
  };

  const renderStreamer = ({ item }: { item: Streamer }) => {
    const isFollowing = following.has(item.id) || item.isFollowing;
    const token = async () => await SecureStore.getItemAsync('appToken');

    return (
      <TouchableOpacity style={styles.streamerCard}>
        <View style={styles.avatarContainer}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.displayName.charAt(0)}</Text>
            </View>
          )}
        </View>
        <View style={styles.streamerInfo}>
          <Text style={styles.streamerName}>{item.displayName}</Text>
          <Text style={styles.streamerLogin}>@{item.twitchLogin}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && styles.followButtonActive,
          ]}
          onPress={() => toggleFollow(item.id)}
        >
          <Text
            style={[
              styles.followButtonText,
              isFollowing && styles.followButtonTextActive,
            ]}
          >
            {isFollowing ? '✓' : '+'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

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
        data={streamers}
        renderItem={renderStreamer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Нет активных стримеров</Text>
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
  streamerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9146FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  streamerInfo: {
    flex: 1,
  },
  streamerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  streamerLogin: {
    fontSize: 14,
    color: '#666',
  },
  followButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  followButtonActive: {
    backgroundColor: '#9146FF',
  },
  followButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  followButtonTextActive: {
    color: '#fff',
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
