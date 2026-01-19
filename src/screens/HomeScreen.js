import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import NetInfo from "@react-native-community/netinfo";

export default function HomeScreen({ navigation }) {
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetwork(state);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wi-Fi Network Monitor</Text>

      {network && (
        <View style={styles.card}>
          <Text>Connected: {network.isConnected ? "Yes" : "No"}</Text>
          <Text>Type: {network.type}</Text>
          <Text>Internet: {network.isInternetReachable ? "Yes" : "No"}</Text>
        </View>
      )}

      <Button
        title="View Detailed Network Info"
        onPress={() => navigation.navigate("NetworkDetails")}
      />
      <Button
        title="View Connected Devices"
        onPress={() => navigation.navigate("Devices")}
      />
      <Button
        title="ABOUT WIFI"
        onPress={() => navigation.navigate("Wifi")}
      />

      <Button
        title="View User Profile"
        onPress={() => navigation.navigate("UserProfile")}
      />

      
    </View>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
  },
});
