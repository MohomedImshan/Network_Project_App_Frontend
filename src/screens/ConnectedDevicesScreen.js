import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import BackendApi from "../api/BackendApi";

export default function ConnectedDevicesScreen() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await BackendApi.get("/devices/getAllDevices");
      setDevices(res.data.devices || []);
    } catch (err) {
      console.error("Failed to fetch devices", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>IP</Text>
      <Text style={styles.value}>{item.ip}</Text>

      <Text style={styles.label}>MAC</Text>
      <Text style={styles.value}>{item.mac}</Text>

      <Text style={styles.status}>Status: {item.status}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ color: "#fff", marginTop: 10 }}>
          Scanning network...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connected Devices</Text>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ color: "#fff", textAlign: "center" }}>
            No devices found
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 15
  },
  title: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold"
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  label: {
    color: "#94a3b8",
    fontSize: 12
  },
  value: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5
  },
  status: {
    color: "#22c55e",
    fontWeight: "bold",
    marginTop: 5
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a"
  }
});
