import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import BackendApi from '../api/BackendApi';

export default function NetworkUsage({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const res = await BackendApi.get('/network-usage/deviceUsage');

      const payload = res.data?.devices ? res.data : res.data?.data;
      setDevices(payload?.devices || []);

      console.log('Fetched network usage:', payload);
    } catch (err) {
      console.error('Network usage fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsage();
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('DeviceDetails', { device: item })
        }
      >
        <Text style={styles.deviceName}>
          {item.device_name !== 'Unknown'
            ? item.device_name
            : `Device (${item.mac.slice(-5)})`}
        </Text>

        <Text style={styles.deviceIp}>{item.ip}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 10 }}>
          Loading network usage...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Usage</Text>

      <FlatList
        data={devices}
        keyExtractor={item => item.id || item.mac}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ color: '#fff', textAlign: 'center' }}>
            No usage data available
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 15,
  },

  title: {
    fontSize: 26,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#1e293b',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 5,
  },

  deviceName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  deviceIp: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
});