import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import { API_BASE_URL } from "@env";
import BackendApi from '../api/BackendApi'
export default function WifiScreen() {
  const [wifi, setWifi] = useState(null);

  const fetchWifi = async () => {
    try {
      const res = await BackendApi.get('network/wifi');
      console.log("Wifi response:",res.data)
      //const data = await res.json();
      setWifi(res.data);
    } catch (err) {
      console.error("Error fetching Wi-Fi info:", err);
    }
  };

  useEffect(() => {
    fetchWifi();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Wi-Fi Details</Text>
      {wifi ? (
        <View style={styles.card}>
          {Object.entries(wifi).map(([key, value]) => (
            <Text key={key}>
                {key}: {Array.isArray(value) ? value.join(", ") : value}
            </Text>
            ))}

          <Button title="Refresh" onPress={fetchWifi} />
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#0f172a" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  card: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 10 },
});
