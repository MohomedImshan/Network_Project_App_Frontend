import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  RefreshControl,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackendApi from '../api/BackendApi';
import notifee, { AndroidImportance } from '@notifee/react-native';
import Modal from 'react-native-modal';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [wifiData, setWifiData] = useState(null);
  const [wifiid, setWiifid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [network, setNetwork] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleNotifications = async () => {
    if (!showNotification) await fetchNotifications();
    setShowNotification(prev => !prev);
  };

  const fetchWifiInfo = async () => {
    try {
      const res = await BackendApi.get('/network/wifi');
      const res2 = await BackendApi.get('/network/wifiid');
      setWifiData(res.data);
      setWiifid(res2.data.id);
    } catch (err) {
      console.log("Error fetching Home SSID:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await BackendApi.get('/notifications');
      const allNotifications = res.data;
      setNotifications(allNotifications);
      const unread = allNotifications.filter(n => !n.is_read);
      setUnreadCount(unread.length);
      if (unread.length > 0) await sendLocalNotification(unread[0]);
    } catch (err) {
      console.log("Error fetching notifications:", err);
    }
  };

  const sendLocalNotification = async (notif) => {
    try {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
      await notifee.displayNotification({
        title: notif.title,
        body: notif.body,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: { id: 'default' },
        },
      });
    } catch (err) {
      console.log("Notification Error:", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await BackendApi.post(`/notifications/mark-read/${notification.id}`);
      await fetchNotifications();
      const res = await BackendApi.get('/notifications/unread-count');
      setUnreadCount(res.data.unread_count);
      setShowNotification(false);

      if (notification.type === "new_device") {
        navigation.navigate("NetworkUsage");
      } else if (notification.type === "alert") {
        navigation.navigate("NetworkDetails");
      }
    } catch (err) {
      console.log("Error handling notification:", err);
    }
  };

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }
    };
    requestPermission();
    const unsubscribe = NetInfo.addEventListener(state => setNetwork(state));
    fetchWifiInfo();
    fetchNotifications();
    BackendApi.get('/notifications/unread-count')
      .then(res => setUnreadCount(res.data.unread_count))
      .catch(err => console.log(err));
    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWifiInfo();
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  const getStatusColor = () => {
    if (!wifiData) return "#475569";
    if (wifiData.ssid && wifiData.ssid !== "Unknown") return "#4cf563";
    return "#ef4444";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1c2e" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Network Monitor</Text>
          <View style={styles.statusBadgeRow}>
             <View style={[styles.liveDot, { backgroundColor: getStatusColor() }]} />
             <Text style={styles.subGreeting}>
                {loading ? 'Initializing...' : (wifiData?.ssid ? 'Active Mode' : 'Offline Mode')}
             </Text>
          </View>
        </View>

        <TouchableOpacity onPress={toggleNotifications} style={styles.notificationBtn}>
          <MaterialCommunityIcons name="bell-outline" size={26} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4c6ef5" />}
      >
        {/* MAIN STATUS CARD */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onRefresh}
          style={[styles.statusCard, { backgroundColor: '#0a96ce'}]}
        >
          <View style={styles.statusHeader}>
            <View style={styles.iconCircleWhite}>
              <MaterialCommunityIcons name="wifi" size={28} color={getStatusColor()} />
            </View>
            <View style={styles.glassBadge}>
              <Text style={styles.glassBadgeText}>{wifiData?.ssid ? 'CONNECTED' : 'SCANNING'}</Text>
            </View>
          </View>
          <Text style={styles.statusTitle} numberOfLines={1}>{wifiData?.ssid || "No Connection"}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Dashboard Hub</Text>

        <View style={styles.gridContainer}>
          {[
            { title: 'Analytics', sub: 'Network Stats', icon: 'chart-arc', color: '#4c6ef5', screen: 'NetworkDetails' },
            { title: 'Devices', sub: 'Scan Live', icon: 'devices', color: '#f59e0b', screen: 'NetworkUsage' },
            { title: 'Hardware', sub: 'WiFi Info', icon: 'router-wireless', color: '#10b981', screen: 'Wifi' },
            { title: 'Logs', sub: '30 Day History', icon: 'history', color: '#ec4899', screen: 'DeviceHistory', params: { wifi_id: wifiid, ssid: wifiData?.ssid } },
            { title: 'Profile', sub: 'Account Info', icon: 'account-cog', color: '#8b5cf6', screen: 'UserProfile' }
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen, item.params || {})}
            >
              <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
                <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* NOTIFICATION SIDEBAR DRAWER */}
      <Modal
        isVisible={showNotification}
        onBackdropPress={toggleNotifications}
        backdropOpacity={0.5}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        style={styles.modalStyle}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Activity</Text>
              <Text style={styles.modalSubTitle}>{unreadCount} New Alerts</Text>
            </View>
            <TouchableOpacity onPress={toggleNotifications}>
              <MaterialCommunityIcons name="chevron-right" size={30} color="#4c6ef5" />
            </TouchableOpacity>
          </View>

          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="bell-sleep" size={60} color="#2d334a" />
              <Text style={styles.noNotif}>Clear Skies</Text>
              <Text style={styles.noNotifSub}>No recent notifications.</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {notifications.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.notifCard, !item.is_read && styles.notifUnread]}
                  onPress={() => handleNotificationClick(item)}
                >
                  <View style={[styles.notifIcon, { backgroundColor: item.is_read ? '#1e2136' : 'rgba(76,110,245,0.1)' }]}>
                    <MaterialCommunityIcons 
                      name={item.type === 'alert' ? 'shield-alert' : 'bullseye-arrow'} 
                      size={20} 
                      color={item.is_read ? '#5c6370' : '#4c6ef5'} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifTitleText, !item.is_read && { color: '#fff' }]}>{item.title}</Text>
                    <Text style={styles.notifBodyText} numberOfLines={2}>{item.message}</Text>
                  </View>
                  {!item.is_read && <View style={styles.unreadPulse} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={toggleNotifications}>
            <Text style={styles.closeBtnText}>HIDE PANEL</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1a1c2e', 
    paddingTop: Platform.OS === 'ios' ? 50 : 20 
  },

  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 15,
    paddingVertical: 40, 
  },

  greeting: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#fff', 
    letterSpacing: 0.5 
  },
  statusBadgeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4 
  },

  liveDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 8 
  },

  subGreeting: { 
    fontSize: 13, 
    color: '#adb5bd', 
    fontWeight: '600' 
  },

  notificationBtn: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: '#1e2136', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  countBadge: { 
    position: 'absolute', 
    top: -4, 
    right: -4, 
    backgroundColor: '#ef4444', 
    minWidth: 20, 
    height: 20,
     borderRadius: 10, 
     justifyContent: 'center', 
     alignItems: 'center', 
     borderWidth: 3, 
     borderColor: '#1a1c2e' 
    },

  countText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  
  statusCard: { 
    marginHorizontal: 20, 
    borderRadius: 24, 
    padding: 25, 
    marginBottom: 30, 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOpacity: 0.3, 
    shadowRadius: 10 
  },

  statusHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },

  iconCircleWhite: { 
    width: 50, 
    height: 50, 
    borderRadius: 15, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  glassBadge: { 
    backgroundColor: 'rgba(255, 254, 254, 0.86)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10 
  },

  glassBadgeText: { 
    color: '#1546e4', 
    fontSize: 10, 
    fontWeight: '900', 
    letterSpacing: 1 
  },

  statusTitle: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#fff' 
  },

  ipText: { 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 14, 
    marginTop: 5, 
    fontFamily: 'monospace' 
  },

  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#fff', 
    marginHorizontal: 20, 
    marginBottom: 15 
  },

  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 15, 
    justifyContent: 'space-between' 
  },

  card: { 
    backgroundColor: '#1e2136', 
    width: (width - 50) / 2, 
    borderRadius: 22, 
    padding: 20, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },

  iconBox: { 
    width: 50, 
    height: 50, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15 
  },

  cardTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#fff' 
  },

  cardSubtitle: { 
    fontSize: 12, 
    color: '#5c6370',
    marginTop: 2 
  },

  modalStyle: { 
    margin: 0, 
    justifyContent: 'flex-end', 
    flexDirection: 'row' 
  },

  modalContainer: { 
    backgroundColor: '#1a1c2e', 
    width: width * 0.8, 
    height: height, 
    borderLeftWidth: 1, 
    borderLeftColor: 'rgba(255,255,255,0.1)', 
    paddingHorizontal: 20, 
    paddingTop: 50 },

  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30 
  },

  modalTitle: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: '900' 
  },

  modalSubTitle: { 
    color: '#4c6ef5', 
    fontSize: 12, 
    fontWeight: '700',
    marginTop: 2 
  },

  notifCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 18, 
    backgroundColor: '#1e2136', 
    marginBottom: 12 
  },

  notifUnread: { 
    borderLeftWidth: 3, 
    borderLeftColor: '#4c6ef5', 
    backgroundColor: '#252945' 
  },

  notifIcon: { 
    width: 40, 
    height: 40, 
    orderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },

  notifTitleText: { 
    color: '#adb5bd', 
    fontSize: 14, 
    fontWeight: '700' 
  },

  notifBodyText: { 
    color: '#5c6370', 
    fontSize: 12, 
    marginTop: 4 
  },

  unreadPulse: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#4c6ef5' 
  },

  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    opacity: 0.5 
  },

  noNotif: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '800', 
    marginTop: 10 
  },

  noNotifSub: { 
    color: '#5c6370', 
    fontSize: 13 
  },

  closeBtn: { 
    marginVertical: 30, 
    height: 50, 
    borderRadius: 15, 
    backgroundColor: '#1e2136', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },

  closeBtnText: { 
    color: '#5c6370', 
    fontSize: 12, 
    fontWeight: '900', 
    letterSpacing: 1 
  }
});