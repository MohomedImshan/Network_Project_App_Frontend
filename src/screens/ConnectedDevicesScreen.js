import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import BackendApi from "../api/BackendApi";

export default function ConnectedDevicesScreen() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDevice, setExpandedDevice] = useState(null); // track expanded device

  const fetchDevices = async () => {
    try {
      setLoading(true);
      await BackendApi.post("/devices/refresh"); // trigger scan
      const res = await BackendApi.get("/devices/getAllDevices");
      setDevices(res.data.devices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  
  const getConnectedTime = (item) => {
    if (!item.connected_at) return "—";

    const start = new Date(item.connected_at).getTime();
    const end = item.disconnected_at
      ? new Date(item.disconnected_at).getTime()
      : Date.now();

    const seconds = Math.floor((end - start) / 1000);
    const minutes = Math.floor(seconds / 60);

    return `${minutes} min`;
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  const toggleExpand = (id) => {
    setExpandedDevice(expandedDevice === id ? null : id);
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedDevice === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.label}>Device Name</Text>
        <Text style={styles.value}>{item.device_name}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>

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
              <Text style={styles.label}>Manufacturer</Text>
              <Text style={styles.value}>{item.manufacturer}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Connected</Text>
              <Text style={styles.value}>{getConnectedTime(item)}</Text>
            </View>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Download</Text>
                <Text style={styles.value}>
                  {(item.bytes_recv / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.label}>Upload</Text>
                <Text style={styles.value}>
                  {(item.bytes_sent / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.label}>Packets Sent</Text>
                <Text style={styles.value}>{item.packets_sent}</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.label}>Packets Received</Text>
                <Text style={styles.value}>{item.packets_recv}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Connected at</Text>
              <Text style={styles.value}>
                {new Date(item.connected_at).toLocaleTimeString()}
              </Text>
            </View>
            {item.disconnected_at && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Disconnected at</Text>
                <Text style={styles.value}>
                  {new Date(item.disconnected_at).toLocaleTimeString()}
                </Text>
              </View>
            )}
          </View>
          
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Scanning network...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connected Devices</Text>
      <TouchableOpacity style={styles.refreshBtn} onPress={fetchDevices}>
        <Text style={styles.refreshText}>🔄 Refresh Scan</Text>
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={{ color: "#fff", textAlign: "center" }}>No devices found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 15 },
  title: { fontSize: 24, color: "#fff", textAlign: "center", marginBottom: 20, fontWeight: "bold" },
  card: { backgroundColor: "#1e293b", padding: 15, borderRadius: 10, marginBottom: 10 },
  label: { color: "#94a3b8", fontSize: 12 },
  value: { color: "#fff", fontSize: 16, marginBottom: 5 },
  status: { color: "#22c55e", fontWeight: "bold", marginTop: 5 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" },
  refreshBtn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 15 },
  refreshText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  lastSeen: { color: "#94a3b8", fontSize: 12, marginTop: 5 },
  detailsGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%", // 2 columns
    marginBottom: 10,
    backgroundColor: "#334155",
    padding: 8,
    borderRadius: 6,
  },
  grid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginTop: 10
},
gridItem: {
  width: "48%",
  backgroundColor: "#334155",
  padding: 10,
  borderRadius: 8,
  marginBottom: 8
}

});
