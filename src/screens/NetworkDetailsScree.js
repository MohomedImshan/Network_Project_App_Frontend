import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { NetworkInfo } from 'react-native-network-info';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Path, Circle, Line } from 'react-native-svg'; // <--- ADDED THIS BACK
import { API_BASE_URL, DEVICE_ID } from '@env';

const { width } = Dimensions.get('window');

// --- 1. CUSTOM SPEEDOMETER COMPONENT (Restored) ---
const Speedometer = ({ value, maxVal = 100, label }) => {
  const radius = 80; // Slightly smaller to fit card
  const strokeWidth = 12;
  const center = radius + strokeWidth;
  const circumference = Math.PI * radius; 
  
  const constrainedValue = Math.min(Math.max(value, 0), maxVal);
  const progress = constrainedValue / maxVal;
  const angle = progress * 180; 
  
  // Needle Math
  const needleAngle = angle - 180; 
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = radius - 15;
  const needleX = center + needleLen * Math.cos(needleRad);
  const needleY = center + needleLen * Math.sin(needleRad);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 160 }}>
       <Svg width={center * 2} height={center + 20}>
         {/* Background Arc (Dark Blue for contrast on Blue Card) */}
         <Path
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={strokeWidth}
            fill="none"
            d={`M${strokeWidth},${center} A${radius},${radius} 0 0,1 ${center * 2 - strokeWidth},${center}`}
            strokeLinecap="round"
         />
         {/* Progress Arc (White) */}
         <Path
            stroke="#fff" 
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={[circumference, circumference]}
            strokeDashoffset={circumference * (1 - progress)}
            d={`M${strokeWidth},${center} A${radius},${radius} 0 0,1 ${center * 2 - strokeWidth},${center}`}
            strokeLinecap="round"
         />
         {/* Needle */}
         <Line
            x1={center} y1={center}
            x2={needleX} y2={needleY}
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
         />
         <Circle cx={center} cy={center} r="6" fill="#fff" />
       </Svg>
       
       <View style={{ position: 'absolute', top: center - 35, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>
            {value.toFixed(1)}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Mbps</Text>
       </View>
       <Text style={{ color: '#fff', fontSize: 14, fontWeight:'600', marginTop:-10 }}>{label}</Text>
    </View>
  );
};

export default function NetworkDetailsScreen({ navigation }) {
  // --- STATE ---
  const [info, setInfo] = useState({});
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [ping, setPing] = useState(null);
  
  // Speedometer Animation State
  const [liveSpeed, setLiveSpeed] = useState(0); 
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [testPhase, setTestPhase] = useState(''); // 'DOWNLOAD' or 'UPLOAD'
  const [loadingPing, setLoadingPing] = useState(false);

  // --- HELPER FUNCTIONS ---
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      } catch (err) { console.warn(err); }
    }
  };

  const loadNetworkInfo = async () => {
    await requestPermissions();
    const state = await NetInfo.fetch();
    const ip = await NetworkInfo.getIPV4Address();
    const gateway = await NetworkInfo.getGatewayIPAddress();
    const ssid = await NetworkInfo.getSSID();

    setInfo({
      isConnected: state.isConnected,
      type: state.type,
      ip: ip || 'Unknown',
      gateway: gateway || 'Unknown',
      ssid: ssid && ssid !== '<unknown ssid>' ? ssid : 'Unknown Network',
    });
  };

  // --- ANIMATED SPEED TEST LOGIC (Restored from Code 1) ---
  const runSpeedTest = async () => {
    setIsTestingSpeed(true);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setLiveSpeed(0);

    try {
      // 1. DOWNLOAD PHASE
      setTestPhase('DOWNLOAD');
      
      // Start Animation Loop (Wobbly Needle)
      const simInterval = setInterval(() => {
        const randomFluctuation = Math.random() * 20 + 5; // Fake movement 5-25 Mbps
        setLiveSpeed(randomFluctuation);
      }, 150);

      // Real Download
      const downloadSize = 5000000; 
      const testUrl = `https://speed.cloudflare.com/__down?bytes=${downloadSize}`; 
      const startDl = Date.now();
      
      const response = await fetch(testUrl, { cache: 'no-store' });
      await response.blob();
      
      const endDl = Date.now();
      const duration = (endDl - startDl) / 1000;
      const loadedBits = downloadSize * 8;
      const speedMbps = (loadedBits / duration) / 1000000;
      
      clearInterval(simInterval);
      setLiveSpeed(speedMbps);
      setDownloadSpeed(speedMbps.toFixed(2));

      // Pause before upload
      await new Promise(r => setTimeout(r, 800));

      // 2. UPLOAD PHASE (Simulated)
      setTestPhase('UPLOAD');
      
      // Start Upload Animation
      const ulSimInterval = setInterval(() => {
        const randomFluctuation = Math.random() * (speedMbps * 0.4); 
        setLiveSpeed(randomFluctuation);
      }, 150);
      
      await new Promise(r => setTimeout(r, 1500)); // Fake processing time
      
      const uploadEst = speedMbps * 0.35; // Estimate 35% of download
      clearInterval(ulSimInterval);
      
      setLiveSpeed(uploadEst);
      setUploadSpeed(uploadEst.toFixed(2));

    } catch (err) {
      console.error('Speed test failed', err);
      setDownloadSpeed('Err');
      setUploadSpeed('Err');
    } finally {
      setIsTestingSpeed(false);
      setLiveSpeed(0);
      setTestPhase('');
    }
  };

  const checkPing = async () => {
    setLoadingPing(true);
    try {
      // Using API_BASE_URL as requested
      const res = await fetch(`${API_BASE_URL}/ping/`, { headers: { Accept: 'application/json' }});
      if (!res.ok) throw new Error('Ping failed');
      const data = await res.json();
      setPing(data.ping);
    } catch (e) {
      setPing(null);
    } finally {
      setLoadingPing(false);
    }
  };

  const sendNetworkData = async payload => {
    try {
      // Backend Sync Logic
      // await BackendApi.post('/network/wifi', payload);
      console.log('Sync success (Simulated)', payload);
    } catch (err) { console.log('Sync error:', err); }
  };

  // --- EFFECTS ---
  useEffect(() => {
    // 1. Initial Load
    loadNetworkInfo();
    checkPing();

    // 2. Set Interval to refresh Ping every 30 seconds (30000 ms)
    const intervalId = setInterval(() => {
      checkPing();
    }, 30000);

    // 3. Cleanup: Stop the timer if the user leaves this screen
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (info.ip && ping !== null && downloadSpeed !== null && uploadSpeed !== null) {
      sendNetworkData({
        device_id: DEVICE_ID,
        ip: info.ip,
        gateway: info.gateway,
        ssid: info.ssid,
        ping,
        download_mbps: parseFloat(downloadSpeed),
        upload_mbps: parseFloat(uploadSpeed),
      });
    }
  }, [info, ping, downloadSpeed, uploadSpeed]);

  const getStatusColor = () => (info.isConnected ? '#10b981' : '#ef4444');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Network Details</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadNetworkInfo}>
          <MaterialCommunityIcons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* === MAIN CARD WITH SPEED METER === */}
        <View style={styles.mainCard}>
          
          {/* Status Badge */}
          <View style={styles.connectionBadge}>
            <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.connectionText}>
              {info.isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>

          {/* Network Name */}
          {/* <Text style={styles.ssidText}>{info.ssid || 'Unknown Network'}</Text>
          <Text style={styles.ipText}>{info.ip || '--'}</Text> */}

          {/* === DYNAMIC SPEEDOMETER SECTION === */}
          <View style={styles.meterContainer}>
             
            {isTestingSpeed ? (
                // 1. RUNNING: Show Gauge
                <Speedometer value={parseFloat(liveSpeed)} label={testPhase} />
            ) : !downloadSpeed ? (
                // 2. IDLE: Show Start Button
                 <TouchableOpacity style={styles.startCircleButton} onPress={runSpeedTest}>
                    <Text style={styles.startBtnText}>GO</Text>
                 </TouchableOpacity>
            ) : (
                // 3. DONE: Show Results
                <View style={styles.resultRowContainer}>
                  {/* Download */}
                  <View style={styles.resultItem}>
                    <View style={styles.resultIconBox}>
                      <MaterialCommunityIcons name="arrow-down" size={16} color="#10b981" />
                    </View>
                    <Text style={styles.resultLabel}>Download</Text>
                    <Text style={styles.resultValue}>{downloadSpeed}</Text>
                    <Text style={styles.resultUnit}>Mbps</Text>
                  </View>
                  
                  <View style={styles.verticalDivider} />

                  {/* Upload */}
                  <View style={styles.resultItem}>
                     <View style={[styles.resultIconBox, {backgroundColor: 'rgba(255, 255, 255, 0.2)'}]}>
                      <MaterialCommunityIcons name="arrow-up" size={16} color="#fff" />
                    </View>
                    <Text style={styles.resultLabel}>Upload</Text>
                    <Text style={styles.resultValue}>{uploadSpeed}</Text>
                    <Text style={styles.resultUnit}>Mbps</Text>
                  </View>

                   {/* Re-test Button */}
                  <TouchableOpacity style={styles.retestButton} onPress={runSpeedTest}>
                      <MaterialCommunityIcons name="refresh" size={20} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                </View>
            )}
          </View>
        </View>

        {/* STATS GRID */}
        <View style={styles.gridContainer}>
          <View style={[styles.statCard, { width: '100%' }]}> 
             <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%'}}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                   <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.2)', marginBottom:0, marginRight:12 }]}>
                    <MaterialCommunityIcons name="server-network" size={24} color="#8b5cf6" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Server Latency (Ping)</Text>
                    <View style={styles.valueRow}>
                      <Text style={[styles.statValue, {fontSize:20}]}>
                        {ping !== null ? ping : '--'}
                      </Text>
                      <Text style={styles.unitText}>ms</Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity onPress={checkPing} disabled={loadingPing} style={styles.miniButton}>
                   {loadingPing ? <ActivityIndicator color="#fff" size="small"/> : <Text style={styles.miniButtonText}>Check</Text>}
                </TouchableOpacity>
             </View>
          </View>
        </View>

        {/* DETAILS LIST */}
        <Text style={styles.sectionTitle}>Technical Details</Text>
        <View style={styles.detailsList}>
          {/* <DetailRow icon="ip-network" label="Gateway IP" value={info.gateway || 'Unreachable'} color="#3b82f6" />
          <View style={styles.divider} /> */}
          <DetailRow icon="shield-check" label="Security" value="WPA2 / WPA3" color="#f59e0b" />
          <View style={styles.divider} />
          <DetailRow icon="radio-tower" label="Frequency" value="2.4 / 5 GHz" color="#ec4899" />
        </View>
      </ScrollView>
    </View>
  );
}

// Sub-component for list rows
const DetailRow = ({ icon, label, value, color }) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <View style={[styles.rowIcon, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: 30, 
    backgroundColor: '#0f172a',
    borderBottomWidth: 1, 
    borderBottomColor: '#1e293b',
  },
  backButton: { 
    padding: 8, 
    borderRadius: 12, 
    backgroundColor: '#1e293b' },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff' },
  refreshButton: { 
    padding: 8 },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40 },
  
  // MAIN CARD STYLES
  mainCard: {
    backgroundColor: '#3b82f6', 
    borderRadius: 24, padding: 24, 
    alignItems: 'center',
    marginBottom: 24, 
    shadowColor: '#3b82f6', 
    shadowOffset: { 
      width: 0, 
      height: 10 },
    shadowOpacity: 0.3, 
    shadowRadius: 15, 
    elevation: 10,
  },
  connectionBadge: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginBottom: 12,
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 6 },
  connectionText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 12 },
  ssidText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 4, 
    textAlign: 'center' },
  ipText: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.8)', 
    marginBottom: 20 },

  // METER AREA
  meterContainer: {
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: 160, 
  },
  startCircleButton: {
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: '#fff',
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    elevation: 5
  },
  startBtnText: { 
    color: '#3b82f6', 
    fontSize: 24, 
    fontWeight: '900' },
  
  // RESULTS
  resultRowContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', width: '100%',
    backgroundColor: 'rgba(0,0,0,0.15)', 
    padding: 15, 
    borderRadius: 16
  },
  resultItem: { 
    alignItems: 'center', 
    flex:1 },
  resultIconBox: {
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: '#fff',
    justifyContent:'center', 
    alignItems:'center', 
    marginBottom:4
  },
  resultLabel: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 10, 
    textTransform:'uppercase' },
  resultValue: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold' },
  resultUnit: { 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 10 },
  verticalDivider: { 
    width: 1, 
    height: 30, 
    backgroundColor: 'rgba(255,255,255,0.3)' },
  retestButton: { 
    padding: 8, 
    marginLeft: 5 },

  // GENERIC & LISTS
  gridContainer: { 
    marginBottom: 24 },
  statCard: {
    backgroundColor: '#1e293b', 
    borderRadius: 20, 
    padding: 16,
    borderWidth: 1, 
    borderColor: '#334155',
  },
  iconBox: {
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  statLabel: { 
    color: '#94a3b8', 
    fontSize: 12, 
    marginBottom: 2 },
  valueRow: { 
    flexDirection: 'row', 
    alignItems: 'baseline' },
  statValue: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff' },
  unitText: { 
    fontSize: 12, 
    color: '#64748b', 
    marginLeft: 4 },
  miniButton: {
    backgroundColor: '#334155', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 12,
  },
  miniButtonText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: 'bold' },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 16 },
  detailsList: {
    backgroundColor: '#1e293b', 
    borderRadius: 20, 
    padding: 20,
    borderWidth: 1, 
    borderColor: '#334155',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 4 },
  rowLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' },
  rowIcon: {
    width: 32, 
    height: 32, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12,
  },
  rowLabel: { 
    color: '#94a3b8', 
    fontSize: 14 },
  rowValue: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600' },
  divider: { 
    height: 1, 
    backgroundColor: '#334155', 
    marginVertical: 12 },
});