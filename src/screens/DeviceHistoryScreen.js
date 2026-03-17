import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Dimensions
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackendApi from "../api/BackendApi";

export default function DeviceHistoryScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { wifi_id, ssid } = route.params || {};
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wifi_id !== undefined && wifi_id !== null) loadHistory();
  }, [wifi_id]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const url = wifi_id
        ? `/devices/history/monthly?wifi_id=${wifi_id}`
        : `/devices/history/monthly`;
      const res = await BackendApi.get(url);
      setData(res.data);
    } catch (e) {
      console.log("History error", e);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    if (d > 0) return `${d}d ${h}h`;
    return `${h}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const renderDeviceCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons 
            name={item.device_name?.toLowerCase().includes('phone') ? "cellphone" : "laptop"} 
            size={24} 
            color="#6ee7f0" 
          />
        </View>
        <View style={styles.textGroup}>
          <View style={styles.nameRow}>
            <Text style={styles.deviceName} numberOfLines={1}>
              {item.device_name || "Unknown Device"}
            </Text>
            {item.is_new && (
              <View style={styles.newTag}>
                <Text style={styles.newTagText}>NEW</Text>
              </View>
            )}
          </View>
          <Text style={styles.macText}>{item.mac_address.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="ip-network" size={16} color="#adb5bd" />
          <Text style={styles.statValue}>{item.ip}</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#adb5bd" />
          <Text style={styles.statValue}>{formatUptime(item.total_uptime_seconds)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1c2e" />
      
      {/* HEADER WITH BACK AND REFRESH */}
      <View style={styles.navHeader}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.navTitle}>Device History</Text>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={loadHistory}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#3780bb" />
        </TouchableOpacity>
      </View>

      {/* SUB-HEADER: SSID LEFT, COUNT RIGHT */}
      <View style={styles.subHeader}>
         <View style={styles.statusPill}>
            <View style={styles.dot} />
            <Text style={styles.statusText} numberOfLines={1}>
              {ssid || "SCAN LOGS"}
            </Text>
         </View>

         <View style={styles.countBadge}>
            <Text style={styles.countText}>{data.length}</Text>
            <Text style={styles.countLabel}>DEVICES</Text>
         </View>
      </View>

      <View style={styles.body}>
        {loading && data.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4c6ef5" />
            <Text style={styles.loadingText}>Synchronizing history...</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item, index) => `${item.mac_address}-${index}`}
            renderItem={renderDeviceCard}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadHistory} tintColor="#4c6ef5" />
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <MaterialCommunityIcons name="database-off" size={64} color="#2d334a" />
                <Text style={styles.emptyText}>No logs found for this period.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c2e", 
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(76, 173, 238)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '70%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6eeb34',
    marginRight: 10,
    shadowColor: '#6eeb34',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusText: {
    color: '#fcfcfc',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countBadge: {
    alignItems: 'flex-end',
  },
  countText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  countLabel: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  body: {
    flex: 1,
    backgroundColor: '#3f4150', 
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 10,
  },
  listPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#191c35',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(76, 110, 245, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textGroup: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  newTag: {
    backgroundColor: '#41ac52',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  macText: {
    color: '#5c6370',
    fontSize: 12,
    marginTop: 3,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#6c757d',
    marginVertical: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    color: '#6c757d',
    fontSize: 13,
    marginLeft: 7,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingText: {
    color: '#6c757d',
    marginTop: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    color: '#495057',
    marginTop: 12,
    fontSize: 15,
  }
});