import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import BackendApi from '../api/BackendApi';

const { width } = Dimensions.get("window");

export default function WifiScreen({ navigation }) {
  const [wifi, setWifi] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWifi = async () => {
    setLoading(true);
    try {
      const res = await BackendApi.get('/network/wifi');
      console.log("Wifi response:", res.data);
      setWifi(res.data);
    } catch (err) {
      console.error("Error fetching Wi-Fi info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWifi();
  }, []);

  // --- HELPER FUNCTIONS FOR UI ---

  // 1. Format keys from "signal_level" to "Signal Level"
  const formatKey = (key) => {
    return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // 2. Smart Icon Picker based on key name
  const getIconForKey = (key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("ssid")) return "wifi";
    if (lowerKey.includes("ip")) return "ip-network";
    if (lowerKey.includes("mac") || lowerKey.includes("bssid")) return "barcode-scan";
    if (lowerKey.includes("signal") || lowerKey.includes("rssi")) return "signal";
    if (lowerKey.includes("freq")) return "radio-tower";
    if (lowerKey.includes("speed") || lowerKey.includes("rate")) return "speedometer";
    if (lowerKey.includes("security") || lowerKey.includes("auth")) return "shield-check";
    if (lowerKey.includes("channel")) return "access-point-network";
    return "information-outline"; // Default icon
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wi-Fi Intelligence</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchWifi}>
           <MaterialCommunityIcons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Scanning Wi-Fi Details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* TOP BANNER CARD (If SSID exists) */}
          {wifi && wifi.ssid && (
             <View style={styles.bannerCard}>
                <View style={styles.bannerIcon}>
                  <MaterialCommunityIcons name="wifi" size={32} color="#fff" />
                </View>
                <View>
                  <Text style={styles.bannerLabel}>Connected To</Text>
                  <Text style={styles.bannerTitle}>{wifi.ssid}</Text>
                </View>
             </View>
          )}

          <Text style={styles.sectionTitle}>Hardware & Network Data</Text>

          {/* DYNAMIC DATA LIST */}
          <View style={styles.detailsList}>
            {wifi ? (
              Object.entries(wifi).map(([key, value], index) => {
                // Skip displaying SSID again in the list if we showed it in the banner
                if (key.toLowerCase() === 'ssid') return null;

                return (
                  <View key={key}>
                    <View style={styles.row}>
                      <View style={styles.rowLeft}>
                        <View style={styles.iconContainer}>
                          <MaterialCommunityIcons 
                            name={getIconForKey(key)} 
                            size={20} 
                            color="#94a3b8" 
                          />
                        </View>
                        <View>
                          <Text style={styles.rowLabel}>{formatKey(key)}</Text>
                          <Text style={styles.rowValue}>
                            {Array.isArray(value) ? value.join(", ") : String(value)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {/* Add divider unless it's the last item */}
                    {index < Object.entries(wifi).length - 1 && <View style={styles.divider} />}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="wifi-off" size={48} color="#475569" />
                <Text style={styles.emptyText}>No Wi-Fi data available</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchWifi}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <Text style={styles.footerText}>
            Data provided by Network Interface
          </Text>

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  
  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 35,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",},

  backButton: { 
    padding: 8, 
    borderRadius: 12, 
    backgroundColor: "#1e293b" },

  headerTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#fff" },

  refreshButton: { 
    padding: 8 },

  // Loading Styles
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" },

  loadingText: { 
    marginTop: 15, 
    color: "#94a3b8", 
    fontSize: 16 },

  // Scroll Content
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40 },

  // Banner Card
  bannerCard: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  bannerLabel: { 
    color: "rgba(255,255,255,0.8)", 
    fontSize: 12, 
    marginBottom: 2 },

  bannerTitle: { 
    color: "#fff", 
    fontSize: 20, 
    fontWeight: "bold" },

  // List Section
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#94a3b8", 
    marginBottom: 15, 
    textTransform: 'uppercase', 
    letterSpacing: 1 },

  detailsList: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },

  // Row Styles
  row: { 
    paddingVertical: 12 },

  rowLeft: { 
    flexDirection: "row", 
    alignItems: "center" },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#334155"
  },
  rowLabel: { 
    color: "#94a3b8", 
    fontSize: 12, 
    marginBottom: 4 },

  rowValue: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "500" },
  
  divider: { 
    height: 1, 
    backgroundColor: "#334155", 
    marginLeft: 55 },

  // Footer & Empty State
  footerText: { 
    textAlign: "center", 
    color: "#475569", 
    fontSize: 12, 
    marginTop: 30 },

  emptyState: { 
    alignItems: "center", 
    padding: 30 },

  emptyText: { 
    color: "#94a3b8", 
    marginTop: 10, 
    marginBottom: 20 },

  retryButton: { 
    backgroundColor: "#3b82f6", 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 20 },

  retryText: { 
    color: "#fff", 
    fontWeight: "bold" },
});