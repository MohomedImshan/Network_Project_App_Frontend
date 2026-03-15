import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import BackendApi from '../api/BackendApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function SiteVisits({ route, navigation }) {
  const { mac, deviceName } = route.params;

  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await BackendApi.get(`/network-usage/siteVisits?mac=${mac}`);
      setSites(res.data.sites || []);
    } catch (error) {
      console.error('Site visit fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSites();
  };

  const renderItem = ({ item }) => {
    const domain = item.domain || item.website || 'Unknown Site';
    const visits = item.visit_count || item.visits || 1;
    const lastVisit = item.last_visit || 'N/A';

    return (
      <View style={styles.card}>
        <Text style={styles.domain}>{domain}</Text>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Visits: {visits}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Last: {lastVisit}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Loading site visits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{deviceName}</Text>
      </View>

      <FlatList
        data={sites}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No site visit data available</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 15,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    padding: 6,
    marginRight: 10,
  },

  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    flexShrink: 1,
  },

  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  domain: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  badges: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },

  badge: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 6,
  },

  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },

  loadingText: {
    color: '#fff',
    marginTop: 10,
  },

  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },

  separator: {
    height: 10,
  },
});
