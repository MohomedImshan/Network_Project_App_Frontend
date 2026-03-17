import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function DeviceDetails({ route, navigation }) {
  const { device } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{device.device_name}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>IP</Text>
        <Text style={styles.value}>{device.ip}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>MAC</Text>
        <Text style={styles.value}>{device.mac}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Download</Text>
        <Text style={styles.value}>{device.download_mb?.toFixed(2)} MB</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Upload</Text>
        <Text style={styles.value}>{device.upload_mb?.toFixed(2)} MB</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Packets Sent</Text>
        <Text style={styles.value}>{device.packets_sent}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Packets Received</Text>
        <Text style={styles.value}>{device.packets_recv}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Sessions</Text>
        <Text style={styles.value}>{device.session_count}</Text>
      </View>

      <TouchableOpacity
        style={styles.visitButton}
        onPress={() =>
          navigation.navigate('SiteVisits', {
            mac: device.mac,
            deviceName: device.device_name,
          })
        }
      >
        <Text style={styles.visitButtonText}>View Site Visits</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },

  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },

  label: {
    color: '#94a3b8',
    fontSize: 12,
  },

  value: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  visitButton: {
    marginTop: 20,
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  visitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
