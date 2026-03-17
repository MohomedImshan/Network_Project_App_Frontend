import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackendApi from '../../api/BackendApi';

const UserProfile = ({ navigation }) => {
  const [userData, setUserData] = useState({ firstName: '', lastName: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
    }, [])
  );

  const fetchUserDetails = async () => {
    try {
      const userDetailsResponse = await BackendApi.get('/user/profile');
      setUserData({
        firstName: userDetailsResponse.data.firstName,
        lastName: userDetailsResponse.data.lastName,
        email: userDetailsResponse.data.email,
        role: userDetailsResponse.data.role || 'Network Admin'
      });
      setIsLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user details.');
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to disconnect?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  // Helper to get initials
  const getInitials = () => {
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase() || '??';
  };

  if (isLoading) {
    return (
      <View style={styles.loaderCenter}>
        <ActivityIndicator size="large" color="#4c6ef5" />
        <Text style={styles.loaderText}>Syncing Profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1c2e" />

      {/* CUSTOM NAVIGATION HEADER */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Account Settings</Text>
        <View style={{ width: 42 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* PROFILE CARD */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarGlow}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View style={styles.onlineStatus} />
          </View>
          <Text style={styles.userName}>{userData.firstName} {userData.lastName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{userData.role.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="account-outline" size={22} color="#12a8e4" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{userData.firstName} {userData.lastName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="email-outline" size={22} color="#12a8e4" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{userData.email}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>SECURITY & ACCESS</Text>
          
          <TouchableOpacity 
            style={styles.securityCard} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Verification', { email: userData.email, flow: "changePassword" })}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#12a8e4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Account Security</Text>
              <Text style={styles.securityValue}>Update Password</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#66aac5" />
          </TouchableOpacity>
        </View>

        {/* ACTIONS */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
            <MaterialCommunityIcons name="account-edit" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.editBtnText}>EDIT PROFILE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout-variant" size={20} color="#ef4444" style={{marginRight: 8}} />
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c2e",
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(145, 20, 20, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarGlow: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(76, 110, 245, 0.3)',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8e9f3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236, 215, 215, 0.1)',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#66aac5',
    letterSpacing: 2,
  },
  onlineStatus: {
    width: 18,
    height: 18,
    backgroundColor: '#10b981',
    borderRadius: 9,
    position: 'absolute',
    bottom: 5,
    right: 5,
    borderWidth: 3,
    borderColor: '#1a1c2e',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#66aac5)',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: {
    color: '#66aac5',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#66aac5',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 15,
    marginTop: 20,
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: '#1e2136',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#66aac5',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 110, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#5c6370',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 15,
    marginLeft: 60,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 110, 245, 0.05)',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#66aac5',
  },
  securityValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonSection: {
    paddingHorizontal: 20,
    marginTop: 35,
  },
  editBtn: {
    backgroundColor: '#1ba3c5',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#4c6ef5',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoutBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loaderCenter: {
    flex: 1,
    backgroundColor: '#1a1c2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#adb5bd',
    marginTop: 15,
    fontWeight: '600',
  }
});

export default UserProfile;