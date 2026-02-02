import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import BackendApi from '../api/BackendApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // or '@expo/vector-icons'

export default function NetworkUsage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDevice, setExpandedDevice] = useState(null);

  // Keep animated values per device id for arrow rotation
  const rotationAnimations = useRef({}).current;

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const res = await BackendApi.get('/network-usage/deviceUsage');
      const payload = res.data?.devices ? res.data : res.data?.data;
      setDevices(payload?.devices || []);
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

  const toggleExpand = id => {
    if (!rotationAnimations[id]) {
      rotationAnimations[id] = new Animated.Value(0);
    }

    if (expandedDevice === id) {
      // collapse
      Animated.timing(rotationAnimations[id], {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
      setExpandedDevice(null);
    } else {
      // collapse previously opened arrow first
      if (expandedDevice && rotationAnimations[expandedDevice]) {
        Animated.timing(rotationAnimations[expandedDevice], {
          toValue: 0,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();
      }
      // expand new arrow
      Animated.timing(rotationAnimations[id], {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
      setExpandedDevice(id);
    }
  };

  const renderItem = ({ item }) => {
    const id = item.id || item.mac;
    const isExpanded = expandedDevice === id;

    if (!rotationAnimations[id]) {
      rotationAnimations[id] = new Animated.Value(isExpanded ? 1 : 0);
    }

    const rotateInterpolate = rotationAnimations[id].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'], // arrow points down when expanded
    });

    return (
      <TouchableOpacity
        onPress={() => toggleExpand(id)}
        activeOpacity={0.8}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.deviceName}>
              {item.device_name !== 'Unknown'
                ? item.device_name
                : `Device (${item.mac.slice(-5)})`}
            </Text>
            <Text style={styles.deviceIp}>{item.ip}</Text>
          </View>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={28}
              color="#94a3b8"
            />
          </Animated.View>
        </View>

        {isExpanded && (
          <View style={styles.detailsGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>IP</Text>
              <Text style={styles.value}>{item.ip}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.label}>MAC</Text>
              <Text style={styles.value}>{item.mac}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.label}>Download</Text>
              <Text style={styles.value}>
                {item.download_mb?.toFixed(2)} MB
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.label}>Upload</Text>
              <Text style={styles.value}>{item.upload_mb?.toFixed(2)} MB</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.label}>Packets Sent</Text>
              <Text style={styles.value}>{item.packets_sent}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.label}>Packets Received</Text>
              <Text style={styles.value}>{item.packets_recv}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.label}>Sessions</Text>
              <Text style={styles.value}>{item.session_count}</Text>
            </View>
          </View>
        )}
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
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 8,
  },

  deviceName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  deviceIp: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },

  label: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 2,
  },

  value: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },

  detailsGrid: {
    marginTop: 10,
    flexDirection: 'column',
  },

  gridItem: {
    width: '100%',
    backgroundColor: '#273549',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
});
