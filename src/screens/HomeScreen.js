import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Linking
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    const initNetwork = async () => {
      // 1. ANDROID PERMISSION REQUEST
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission Needed",
              message: "Android requires Location access to show the Wi-Fi Name (SSID).",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Location permission granted");
          } else {
            console.log("Location permission denied");
          }
        } catch (err) {
          console.warn(err);
        }
      }

      // 2. SUBSCRIBE TO NETWORK UPDATES
      const unsubscribe = NetInfo.addEventListener((state) => {
        setNetwork(state);
      });
      return unsubscribe;
    };

    let unsubscribeFn;
    initNetwork().then((unsub) => {
      unsubscribeFn = unsub;
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, []);

  // --- LOGIC HELPERS ---

  const getStatusColor = () => {
    if (!network) return "#64748b"; 
    return network.isConnected && network.isInternetReachable ? "#10b981" : "#ef4444"; 
  };

  const getStatusText = () => {
    if (!network) return "Checking...";
    if (network.isConnected && network.isInternetReachable) return "Online";
    if (network.isConnected) return "No Internet";
    return "Disconnected";
  };

  // SMART SSID DETECTOR
  const getSSID = () => {
    if (!network) return "Initializing...";
    
    // Check if Wifi
    if (network.type === 'wifi') {
      const ssid = network.details?.ssid;
      // Android hides SSID if GPS is off, returning "<unknown ssid>"
      if (!ssid || ssid === '<unknown ssid>') {
        return "Unknown (Turn On GPS)";
      }
      return ssid;
    }
    
    // If connected but NOT wifi (e.g. Emulator uses Ethernet, Phone uses 4G)
    if (network.isConnected) {
      return `Not Wi-Fi (${network.type})`;
    }

    return "No Connection";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Network Monitor</Text>
          <Text style={styles.subGreeting}>Welcome back</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("UserProfile")}>
          <View style={styles.profileIcon}>
             <MaterialCommunityIcons name="account" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* MAIN STATUS CARD */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons name="wifi" size={32} color="#fff" />
            <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.badgeText}>{getStatusText()}</Text>
            </View>
          </View>
          
          {/* DISPLAY THE SMART SSID */}
          <Text style={styles.statusTitle}>
            {getSSID()}
          </Text>
          
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Type</Text>
              <Text style={styles.statusValue}>{network?.type?.toUpperCase() || "--"}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Internet</Text>
              <Text style={styles.statusValue}>
                {network?.isInternetReachable ? "Reachable" : "Unreachable"}
              </Text>
            </View>
          </View>
          
          {/* TIP: Click to open Location Settings if needed */}
          {getSSID() === "Unknown (Turn On GPS)" && (
            <TouchableOpacity 
              style={{ marginTop: 15, backgroundColor: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, alignItems: 'center'}}
              onPress={() => Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS')}
            >
              <Text style={{color: '#fff', fontSize: 12}}>Tap to Open Location Settings</Text>
            </TouchableOpacity>
          )}

        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("NetworkDetails")}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(59, 130, 246, 0.2)" }]}>
              <MaterialCommunityIcons name="chart-box-outline" size={28} color="#3b82f6" />
            </View>
            <Text style={styles.cardTitle}>Network Details</Text>
            <Text style={styles.cardSubtitle}>IP, Signal, Freq</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Devices")}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(245, 158, 11, 0.2)" }]}>
              <MaterialCommunityIcons name="devices" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.cardTitle}>Devices</Text>
            <Text style={styles.cardSubtitle}>Scan Network</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Wifi")}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.2)" }]}>
              <MaterialCommunityIcons name="information-outline" size={28} color="#10b981" />
            </View>
            <Text style={styles.cardTitle}>About Wi-Fi</Text>
            <Text style={styles.cardSubtitle}>Hardware Info</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("UserProfile")}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(139, 92, 246, 0.2)" }]}>
              <MaterialCommunityIcons name="cog-outline" size={28} color="#8b5cf6" />
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
    backgroundColor: "#0f172a", 
    paddingTop: 40, 
    paddingHorizontal: 20 },

  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", marginBottom: 25, 
    marginTop: 10 },

  greeting: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#fff" },

  subGreeting: { 
    fontSize: 14, 
    color: "#94a3b8" },

  profileIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: "#1e293b", 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#334155" },

  statusCard: { 
    backgroundColor: "#3b82f6", 
    borderRadius: 20, padding: 20, 
    marginBottom: 30, 
    shadowColor: "#3b82f6", 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 15, elevation: 10 },

  statusHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    marginBottom: 10 },

  badge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 },

  badgeText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 12 },

  statusTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#fff", 
    marginBottom: 20 },
    
  statusRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    backgroundColor: "rgba(255,255,255,0.15)", 
    borderRadius: 12, 
    padding: 15 },

  statusItem: { 
    alignItems: "center", 
    flex: 1 },

  statusLabel: { 
    color: "rgba(255,255,255,0.8)", 
    fontSize: 12, 
    marginBottom: 4 },

  statusValue: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 14 },

  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#fff", 
    marginBottom: 15 },

  gridContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    paddingBottom: 20 },

  card: { 
    backgroundColor: "#1e293b",
    width: (width - 50) / 2, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: "#334155" },

  iconBox: { 
    width: 50, 
    height: 50, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 12 },

  cardTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#fff", 
    marginBottom: 4 },

  cardSubtitle: { 
    fontSize: 12, 
    color: "#94a3b8" },
});