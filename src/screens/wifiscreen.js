import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Clipboard,
  Platform,
  ToastAndroid,
  Alert,
  RefreshControl
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import BackendApi from '../api/BackendApi'; // Ensure this path is correct

export default function WifiScreen({ navigation }) {
  const [wifi, setWifi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- API CALL ---
  const fetchWifi = async () => {
    try {
      const res = await BackendApi.get('/network/wifi');
      console.log("Wifi Data:", res.data);
      setWifi(res.data);
    } catch (err) {
      console.error("Error fetching Wi-Fi info:", err);
      // Optional: Show error toast
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWifi();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWifi();
  }, []);

  

  const formatKey = (key) => {
    
    return key
      .replace(/_/g, " ")
      .replace("ipv4", "IPv4")
      .replace("dns", "DNS")
      .replace("mac", "MAC")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIconForKey = (key) => {
    const lower = key.toLowerCase();
    if (lower.includes("ssid")) return "wifi";
    if (lower.includes("dns")) return "dns";
    if (lower.includes("ip") || lower.includes("gateway") || lower.includes("mask")) return "ip-network";
    if (lower.includes("mac") || lower.includes("bssid")) return "barcode-scan";
    if (lower.includes("security") || lower.includes("auth")) return "shield-check";
    if (lower.includes("adapter") || lower.includes("interface")) return "expansion-card";
    return "information-outline";
  };

  const getSignalColor = (percentage) => {
    const val = parseInt(percentage, 10);
    if (!val) return "#94a3b8"; 
    if (val >= 80) return "#22c55e"; 
    if (val >= 50) return "#eab308"; 
    return "#ef4444"; 
  };

  const copyToClipboard = (label, value) => {
    if (!value) return;
    const stringValue = Array.isArray(value) ? value.join(", ") : String(value);
    Clipboard.setString(stringValue);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Copied ${label}`, ToastAndroid.SHORT);
    } else {
      Alert.alert("Copied", `${label} copied to clipboard.`);
    }
  };

  
  const HIDDEN_KEYS = [
    'ssid', 'signal_quality', 'channel', 'rx_rate', 'tx_rate', 'band', 
    'radio_type', 'stats', 'error', 'ip' 
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#e2e8f0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wi-Fi Intelligence</Text>
        <TouchableOpacity style={styles.iconButton} onPress={fetchWifi}>
           <MaterialCommunityIcons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Scanning Network...</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6"/>}
        >
          
          {/* 1. STATUS BANNER (SSID) */}
          {wifi && wifi.ssid ? (
             <View style={styles.bannerCard}>
                <View style={styles.bannerIcon}>
                  <MaterialCommunityIcons name="wifi" size={32} color="#fff" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.bannerLabel}>Currently Connected</Text>
                  <Text style={styles.bannerTitle} numberOfLines={1}>{wifi.ssid}</Text>
                </View>
             </View>
          ) : (
            <View style={[styles.bannerCard, { backgroundColor: '#ef4444' }]}>
               <MaterialCommunityIcons name="wifi-off" size={32} color="#fff" style={{marginRight: 15}}/>
               <Text style={styles.bannerTitle}>Disconnected</Text>
            </View>
          )}

          {/* 2. SIGNAL PERFORMANCE CARD */}
          {wifi && wifi.signal_quality && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <MaterialCommunityIcons name="chart-bar" size={20} color="#3b82f6" />
                <Text style={styles.cardTitle}>Signal Health</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.signalContainer}>
                <View style={styles.signalHeader}>
                  <Text style={styles.signalLabel}>Quality</Text>
                  <Text style={[styles.signalValue, { color: getSignalColor(wifi.signal_quality) }]}>
                    {wifi.signal_quality}%
                  </Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${wifi.signal_quality}%`,
                        backgroundColor: getSignalColor(wifi.signal_quality) 
                      }
                    ]} 
                  />
                </View>
              </View>

              {/* Grid Stats */}
              <View style={styles.gridContainer}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridValue}>{wifi.tx_rate || wifi.rx_rate || "N/A"}</Text>
                  <Text style={styles.gridLabel}>Mbps Speed</Text>
                </View>
                <View style={styles.gridBorder} />
                <View style={styles.gridItem}>
                  <Text style={styles.gridValue}>{wifi.band || "N/A"}</Text>
                  <Text style={styles.gridLabel}>Frequency</Text>
                </View>
                <View style={styles.gridBorder} />
                <View style={styles.gridItem}>
                  <Text style={styles.gridValue}>{wifi.channel || "Auto"}</Text>
                  <Text style={styles.gridLabel}>Channel</Text>
                </View>
              </View>
            </View>
          )}

          {/* 3. DATA TRAFFIC STATS (If available) */}
          {wifi && wifi.stats && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <MaterialCommunityIcons name="swap-vertical" size={20} color="#a855f7" />
                <Text style={styles.cardTitle}>Data Traffic</Text>
              </View>
              <View style={styles.trafficRow}>
                <View style={styles.trafficItem}>
                  <MaterialCommunityIcons name="arrow-up-bold" size={20} color="#22c55e" />
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.trafficLabel}>Upload</Text>
                    <Text style={styles.trafficValue}>{formatBytes(wifi.stats.bytes_sent)}</Text>
                  </View>
                </View>
                <View style={styles.trafficItem}>
                  <MaterialCommunityIcons name="arrow-down-bold" size={20} color="#3b82f6" />
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.trafficLabel}>Download</Text>
                    <Text style={styles.trafficValue}>{formatBytes(wifi.stats.bytes_recv)}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* 4. CONFIGURATION LIST */}
          <Text style={styles.sectionHeader}>Network Details</Text>
          <View style={styles.detailsList}>
            {wifi ? (
              Object.entries(wifi).map(([key, value], index) => {
                if (HIDDEN_KEYS.includes(key.toLowerCase()) || !value) return null;

                return (
                  <View key={key}>
                    <TouchableOpacity 
                      style={styles.row}
                      onLongPress={() => copyToClipboard(formatKey(key), value)}
                      activeOpacity={0.6}
                    >
                      <View style={styles.rowLeft}>
                        <View style={styles.iconContainer}>
                          <MaterialCommunityIcons 
                            name={getIconForKey(key)} 
                            size={18} 
                            color="#cbd5e1" 
                          />
                        </View>
                        <View style={styles.textWrapper}>
                          <Text style={styles.rowLabel}>{formatKey(key)}</Text>
                          <Text style={styles.rowValue}>
                            {Array.isArray(value) ? value.join(" • ") : String(value)}
                          </Text>
                        </View>
                        <MaterialCommunityIcons name="content-copy" size={14} color="#475569" style={{opacity: 0.5}}/>
                      </View>
                    </TouchableOpacity>
                    {/* Dynamic Divider */}
                    {index < Object.entries(wifi).length - 1 && <View style={styles.divider} />}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No Network Data Available</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.footerText}>
            System Intelligence v1.0 • Long press to copy
          </Text>

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 40,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    elevation: 2,
  },
  headerTitle: { fontSize: 25, fontWeight: "700", color: "#f8fafc", letterSpacing: 0.5 },
  iconButton: { padding: 8, borderRadius: 12, backgroundColor: "#1e293b" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 15, color: "#94a3b8", fontSize: 16 },
  scrollContent: { padding: 15, paddingBottom: 40 },

  // Banner
  bannerCard: {
    backgroundColor: "#2563eb",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  bannerLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600", marginBottom: 2, textTransform: "uppercase" },
  bannerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  // Cards
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 14, fontWeight: "bold", color: "#f1f5f9", marginLeft: 8, textTransform: 'uppercase' },

  // Signal Section
  signalContainer: { marginBottom: 20 },
  signalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  signalLabel: { color: "#94a3b8", fontSize: 13 },
  signalValue: { fontWeight: "bold", fontSize: 14 },
  progressBarBackground: { height: 6, backgroundColor: "#0f172a", borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  // Grid Section
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gridItem: { alignItems: 'center', flex: 1 },
  gridBorder: { width: 1, height: 25, backgroundColor: "#334155" },
  gridValue: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  gridLabel: { color: "#64748b", fontSize: 11, marginTop: 4 },

  // Traffic Stats
  trafficRow: { flexDirection: 'row', justifyContent: 'space-between' },
  trafficItem: { flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: "#0f172a", padding: 10, borderRadius: 10, marginRight: 5 },
  trafficLabel: { color: "#64748b", fontSize: 11 },
  trafficValue: { color: "#e2e8f0", fontSize: 14, fontWeight: "bold" },

  // Details List
  sectionHeader: { fontSize: 13, fontWeight: "700", color: "#94a3b8", marginBottom: 10, marginLeft: 5, textTransform: 'uppercase', letterSpacing: 1 },
  detailsList: { backgroundColor: "#1e293b", borderRadius: 16, paddingVertical: 5, borderWidth: 1, borderColor: "#334155" },
  row: { paddingVertical: 14, paddingHorizontal: 15 },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: "#0f172a",
    justifyContent: "center", alignItems: "center", marginRight: 12, borderWidth: 1, borderColor: "#334155"
  },
  textWrapper: { flex: 1 },
  rowLabel: { color: "#94a3b8", fontSize: 11, marginBottom: 3 },
  rowValue: { color: "#f8fafc", fontSize: 14, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#334155", marginLeft: 58, marginRight: 15 },

  // Footer
  footerText: { textAlign: "center", color: "#475569", fontSize: 11, marginTop: 25 },
  emptyState: { padding: 20, alignItems: "center" },
  emptyText: { color: "#64748b" },
});