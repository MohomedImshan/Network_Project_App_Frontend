import React, { use, useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ScrollView } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { NetworkInfo } from "react-native-network-info";
import { API_BASE_URL, DEVICE_ID } from "@env";

export default function NetworkDetailsScreen() {
  const [info, setInfo] = useState({});
  const [speed, setSpeed] = useState(null);
  const [ping, setPing] = useState(null);
  const [loading, setLoading] = useState(false);

 
  const sendNetworkData = async (payload) => {
    try {
      await fetch(`${API_BASE_URL}/network`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("Network data sent to backend");
    } catch (err) {
      console.error("Failed to send network data:", err);
    }
  };


  const loadNetworkInfo = async () => {
    const state = await NetInfo.fetch();
    const ip = await NetworkInfo.getIPV4Address();
    const gateway = await NetworkInfo.getGatewayIPAddress();
    const ssid = await NetworkInfo.getSSID();

    setInfo({
      isConnected: state.isConnected,
      type: state.type,
      ip,
      gateway,
      ssid,
    });
  };

  
  const checkSpeed = async () => {
    setLoading(true);
    const start = Date.now();

    const res = await fetch(
      "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
    );
    const blob = await res.blob();

    const duration = (Date.now() - start) / 1000;
    const speedMbps = ((blob.size * 8) / duration) / 1_000_000;

    setSpeed(speedMbps.toFixed(2));
    setLoading(false);
  };

 const checkPing = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/ping`);
    const data = await res.json();
    setPing(data.ping);
  } catch (e) {
    console.error("Ping error", e);
    setPing(null);
  }
};


  useEffect(() => {
  checkPing();
  const interval = setInterval(checkPing, 1000);
  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    if (info.ip && ping && speed) {
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

  useEffect(() => {
    loadNetworkInfo();
  }, []);
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detailed Network Info</Text>

      <View style={styles.card}>
        <Text>Connected: {info.isConnected ? "Yes" : "No"}</Text>
        <Text>Type: {info.type}</Text>
        <Text>IP: {info.ip}</Text>
        <Text>Gateway: {info.gateway}</Text>
        <Text>SSID: {info.ssid}</Text>

        {ping && <Text>Ping: {ping} ms</Text>}
        {speed && <Text>Speed: {speed} Mbps</Text>}

        <View style={{ padding: 20 }}>
      <Text>Ping: {ping !== null ? ping + " ms" : "Calculating..."}</Text>
      <Button title="Check Ping Now" onPress={checkPing} />
    </View>
        <Button
          title={loading ? "Checking Speed..." : "Check Speed"}
          onPress={checkSpeed}
          disabled={loading}
        />
        <Button title="Refresh" onPress={loadNetworkInfo} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
  },
});
