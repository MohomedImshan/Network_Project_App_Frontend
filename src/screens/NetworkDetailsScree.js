import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Platform,
  PermissionsAndroid
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { NetworkInfo } from "react-native-network-info";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { API_BASE_URL, DEVICE_ID } from "@env";
import BackendApi from "../api/BackendApi"; 

const { width } = Dimensions.get("window");

export default function NetworkDetailsScreen({ navigation }) {
  // 1. Hooks must always be at the very top
  const [info, setInfo] = useState({});
  const [speed, setSpeed] = useState(null);
  const [ping, setPing] = useState(null);
  const [loadingSpeed, setLoadingSpeed] = useState(false);
  const [loadingPing, setLoadingPing] = useState(false);

  // 2. Helper Functions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const loadNetworkInfo = async () => {
    await requestPermissions();
    const state = await NetInfo.fetch();
    const ip = await NetworkInfo.getIPV4Address();
    const gateway = await NetworkInfo.getGatewayIPAddress();
    const ssid = await NetworkInfo.getSSID(); 

    setInfo({
      isConnected: state.isConnected,
      type: state.type,
      ip: ip || "Unknown",
      gateway: gateway || "Unknown",
      ssid: (ssid && ssid !== '<unknown ssid>') ? ssid : "Unknown Network",
    });
  };

  const checkSpeed = async () => {
    setLoadingSpeed(true);
    const start = Date.now();
    try {
      const res = await fetch(
        "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
        { cache: "no-store" }
      );
      const blob = await res.blob();
      const duration = (Date.now() - start) / 1000;
      const speedMbps = ((blob.size * 8) / duration) / 1_000_000;
      setSpeed(speedMbps.toFixed(2));
    } catch (err) {
      console.error("Speed test failed", err);
      setSpeed("Error");
    } finally {
      setLoadingSpeed(false);
    }
  };

  const checkPing = async () => {
    setLoadingPing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ping/`, {
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) throw new Error("Ping failed");
      const data = await res.json();
      setPing(data.ping);
    } catch (e) {
      console.log("Ping error:", e.message);
      setPing(null);
    } finally {
      setLoadingPing(false);
    }
  };

  const sendNetworkData = async (payload) => {
    try {
      // Ensure this matches your actual backend endpoint method (POST usually)
      // await BackendApi.post('/network/wifi', payload);
      console.log("Sync success (Simulated)");
    } catch (err) {
      console.log("Sync error:", err);
    }
  };

  // 3. useEffects
  useEffect(() => {
    loadNetworkInfo();
    checkPing();
    
    const interval = setInterval(checkPing, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (info.ip && ping !== null && speed !== null) {
      sendNetworkData({
        device_id: DEVICE_ID,
        ip: info.ip,
        gateway: info.gateway,
        ssid: info.ssid,
        ping,
        speed_mbps: parseFloat(speed),
      });
    }
  }, [info, ping, speed]);


  // 4. Helper for Colors
  const getStatusColor = () => info.isConnected ? "#10b981" : "#ef4444";
  const getPingColor = () => {
    if (!ping) return "#64748b";
    if (ping < 50) return "#10b981"; 
    if (ping < 100) return "#f59e0b"; 
    return "#ef4444"; 
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Network Details</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadNetworkInfo}>
          <MaterialCommunityIcons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* INFO CARD */}
        <View style={styles.mainCard}>
          <View style={styles.connectionBadge}>
            <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.connectionText}>
              {info.isConnected ? "Connected" : "Disconnected"}
            </Text>
          </View>
          
          <Text style={styles.ssidText}>{info.ssid || "Unknown Network"}</Text>
          <Text style={styles.ipText}>IP: {info.ip || "--"}</Text>

          <View style={styles.typeBadge}>
             <MaterialCommunityIcons name={info.type === 'wifi' ? 'wifi' : 'signal'} size={16} color="#cbd5e1" />
             <Text style={styles.typeText}>{info.type?.toUpperCase() || "UNKNOWN"}</Text>
          </View>
        </View>

        {/* STATS GRID */}
        <View style={styles.gridContainer}>
          
          {/* PING */}
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(139, 92, 246, 0.2)" }]}>
              <MaterialCommunityIcons name="server-network" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.statLabel}>Latency</Text>
            
            <View style={styles.valueRow}>
              <Text style={[styles.statValue, { color: getPingColor() }]}>
                {ping !== null ? ping : "--"}
              </Text>
              <Text style={styles.unitText}>ms</Text>
            </View>

            <TouchableOpacity 
              style={styles.miniButton} 
              onPress={checkPing} 
              disabled={loadingPing}
            >
              {loadingPing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.miniButtonText}>Check</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* SPEED */}
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.2)" }]}>
              <MaterialCommunityIcons name="speedometer" size={24} color="#10b981" />
            </View>
            <Text style={styles.statLabel}>Download</Text>

            <View style={styles.valueRow}>
              <Text style={styles.statValue}>
                {speed !== null ? speed : "--"}
              </Text>
              <Text style={styles.unitText}>Mbps</Text>
            </View>

            <TouchableOpacity 
              style={styles.miniButton} 
              onPress={checkSpeed} 
              disabled={loadingSpeed}
            >
              {loadingSpeed ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.miniButtonText}>Test</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>

        {/* DETAILS LIST */}
        <Text style={styles.sectionTitle}>Technical Details</Text>
        <View style={styles.detailsList}>
          
          <DetailRow 
            icon="ip-network" 
            label="Gateway IP" 
            value={info.gateway || "Unreachable"} 
            color="#3b82f6" 
          />
          <View style={styles.divider} />
          
          <DetailRow 
            icon="shield-check" 
            label="Security" 
            value="WPA2 / WPA3" 
            color="#f59e0b" 
          />
          <View style={styles.divider} />
          
          <DetailRow 
            icon="radio-tower" 
            label="Frequency" 
            value="2.4 / 5 GHz" 
            color="#ec4899" 
          />

        </View>

      </ScrollView>
    </View>
  );
}

// Sub-component for list rows
const DetailRow = ({ icon, label, value, color }) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <View style={[styles.rowIcon, { backgroundColor: `${color}20` }]}> 
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15, backgroundColor: "#0f172a", borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: "#1e293b" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  refreshButton: { padding: 8 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  mainCard: { backgroundColor: "#3b82f6", borderRadius: 24, padding: 24, alignItems: "center", marginBottom: 24, shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  connectionBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  connectionText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  ssidText: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 4, textAlign: 'center' },
  ipText: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 16 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  typeText: { color: "#cbd5e1", fontSize: 12, marginLeft: 6, fontWeight: "bold" },
  gridContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  statCard: { backgroundColor: "#1e293b", width: (width - 50) / 2, borderRadius: 20, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  statLabel: { color: "#94a3b8", fontSize: 12, marginBottom: 4 },
  valueRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  unitText: { fontSize: 12, color: "#64748b", marginLeft: 4 },
  miniButton: { backgroundColor: "#334155", paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12, width: "100%", alignItems: "center" },
  miniButtonText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 16 },
  detailsList: { backgroundColor: "#1e293b", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#334155" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  rowIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 12 },
  rowLabel: { color: "#94a3b8", fontSize: 14 },
  rowValue: { color: "#fff", fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#334155", marginVertical: 12 },
});