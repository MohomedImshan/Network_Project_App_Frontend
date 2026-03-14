import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";
// Ensure BackendApi is imported from your config file
import BackendApi from "../api/BackendApi"; 

const screenWidth = Dimensions.get("window").width;

export default function SiteVisits({ route }) {
  const { mac, deviceName } = route.params;
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await BackendApi.get('/network-usage/Sitevisited', { params: { mac } });
      setStats(res.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [mac]); // Added mac as dependency for safety

  // Format data: Limit labels to first 6 characters + limit entries to top 5-6
  const chartData = {
    labels: stats.slice(0, 6).map(item => item.website.split('.')[0]), 
    datasets: [{ data: stats.slice(0, 6).map(item => item.visits) }]
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Website Usage</Text>
        <Text style={styles.subtitle}>{deviceName} ({mac})</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : stats.length > 0 ? (
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={screenWidth - 40}
            height={250}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero={true}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              barPercentage: 0.6,
            }}
            verticalLabelRotation={30} // Rotates labels to prevent overlapping
            style={styles.chartStyle}
          />
        </View>
      ) : (
        <Text style={styles.noData}>No browsing data found for this device.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 10 },
  header: { marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: "bold" },
  subtitle: { fontSize: 12, color: "gray" },
  chartContainer: { alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 10 },
  chartStyle: { marginVertical: 8, borderRadius: 16 },
  noData: { textAlign: 'center', marginTop: 50, color: 'gray' }
});