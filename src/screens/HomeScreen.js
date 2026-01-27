import React, { useEffect, useState, useCallback } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  RefreshControl,
  Image,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Added for potential profile image

import BackendApi from '../api/BackendApi'; // <--- 1. IMPORT YOUR API

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [wifiData, setWifiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [network, setNetwork] = useState(null);

  // --- 2. FETCH DATA FROM BACKEND ---
  const fetchWifiInfo = async () => {
    try {
      const res = await BackendApi.get('/network/wifi');
      // res.data contains { ssid: "Name", ip: "...", etc }
      setWifiData(res.data);
    } catch (err) {
      console.log('Error fetching Home SSID:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
  // ANDROID PERMISSION
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Needed',
            message:
              'Android requires Location access to show the Wi-Fi Name (SSID).',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
        } else {
          console.log('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  requestPermission();

  // NETWORK LISTENER (SYNC)
  const unsubscribe = NetInfo.addEventListener(state => {
    setNetwork(state);
  });

  // INITIAL FETCH
  fetchWifiInfo();

  // CLEANUP
  return () => {
    unsubscribe();
  };
}, []);

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await fetchWifiInfo();
  setRefreshing(false);
}, []);

  // --- HELPERS ---

  // Decide card color based on connection
  const getStatusColor = () => {
    if (!wifiData) return "#64748b"; // Grey (Loading/Error)
    if (wifiData.ssid && wifiData.ssid !== "Unknown") return "#3b82f6"; // Blue (Connected)
    return "#ef4444"; // Red (Disconnected)
  };

  const getStatusText = () => {
    if (loading) return "Scanning...";
    if (wifiData && wifiData.ssid) return "Connected";
    return "Offline";

  };

  // Get the SSID from backend data
  const getSSID = () => {
    if (loading) return "Initializing...";
    if (wifiData && wifiData.ssid) return wifiData.ssid;
    return "No Connection";

  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Network Monitor</Text>
          <Text style={styles.subGreeting}>System Dashboard</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
          <View style={styles.profileIcon}>
            <MaterialCommunityIcons name="account" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
          />
        }
      >
        {/* MAIN STATUS CARD */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={fetchWifiInfo} // Tap card to refresh
          style={[styles.statusCard, { backgroundColor: getStatusColor() }]}
        >
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons name="wifi" size={32} color="#fff" />
            <View style={styles.badge}>
              <Text style={[styles.badgeText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>

     
          {/* DISPLAY THE SMART SSID */}
          {/* <Text style={styles.statusTitle}>{getSSID()}</Text> */}
        {/* </TouchableOpacity>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Type</Text>
              <Text style={styles.statusValue}>
                {network?.type?.toUpperCase() || '--'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Internet</Text>
              <Text style={styles.statusValue}>
                {network?.isInternetReachable ? 'Reachable' : 'Unreachable'}
              </Text>
            </View>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Internet</Text>
            <Text style={styles.statusValue}>
              {network?.isInternetReachable ? 'Reachable' : 'Unreachable'}
            </Text>
          </View>
        </View>
        <View>
          {/* TIP: Click to open Location Settings if needed */}
          {/* {getSSID() === 'Unknown (Turn On GPS)' && (
            <TouchableOpacity
              style={{
                marginTop: 15,
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={() =>
                Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS')
              }
            >
              <Text style={{ color: '#fff', fontSize: 12 }}>
                Tap to Open Location Settings
              </Text>
            </TouchableOpacity>
          )}
        </View> */}

         
          {/* DISPLAY THE SSID FROM PYTHON BACKEND */}
          <Text style={styles.statusTitle} numberOfLines={1}>
            {getSSID()}
          </Text>
          
        </TouchableOpacity> 

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('NetworkDetails')}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
              ]}
            >
              <MaterialCommunityIcons
                name="chart-box-outline"
                size={28}
                color="#3b82f6"
              />
            </View>
            <Text style={styles.cardTitle}>Network Details</Text>
            <Text style={styles.cardSubtitle}>Full Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('NetworkUsage')}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
              ]}
            >
              <MaterialCommunityIcons
                name="devices"
                size={28}
                color="#f59e0b"
              />
            </View>
            <Text style={styles.cardTitle}>Devices</Text>
            <Text style={styles.cardSubtitle}>Scan Network</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Wifi')}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
              ]}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={28}
                color="#10b981"
              />
            </View>
            <Text style={styles.cardTitle}>About Wi-Fi</Text>
            <Text style={styles.cardSubtitle}>Hardware Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DeviceHistory')}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: 'rgba(236, 72, 153, 0.2)' },
              ]}
            >
              <MaterialCommunityIcons
                name="history"
                size={28}
                color="#ec4899"
              />
            </View>
            <Text style={styles.cardTitle}>Device History</Text>
            <Text style={styles.cardSubtitle}>Last 30 Days</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('NetworkUsage')}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
              ]}
            >
              <MaterialCommunityIcons
                name="devices"
                size={28}
                color="#f59e0b"
              />
            </View>
            <Text style={styles.cardTitle}>Devices</Text>
            <Text style={styles.cardSubtitle}>Devices & Usage</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('UserProfile')}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: 'rgba(139, 92, 246, 0.2)' },
              ]}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={28}
                color="#8b5cf6"
              />
            </View>
            <Text style={styles.cardTitle}>Settings</Text>
            <Text style={styles.cardSubtitle}>Profile & App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 40,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },

  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  subGreeting: {
    fontSize: 14,
    color: '#94a3b8',
  },

  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },

  statusCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },

  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  badge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
  
    fontWeight: 'bold',
    fontSize: 12,
  },

  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 15,
  },

  statusItem: {
    alignItems: 'center',
    flex: 1,
  },

  statusLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 4,
  },

  statusValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },

  card: {
    backgroundColor: '#1e293b',
    width: (width - 50) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
