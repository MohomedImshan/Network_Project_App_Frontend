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
  Image,
} from 'react-native';
import BackendApi from '../../api/BackendApi';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProfile = ({ navigation}) => {
    const [userData, setUserData] = useState({firstName: '', lastName: '', email: ''});
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchUserDetails();
        }, [])
    );


  const fetchUserDetails = async() => {
    try{
        const userDetailsResponse = await BackendApi.get('/user/profile');
        setUserData({
            firstName: userDetailsResponse.data.firstName,
            lastName: userDetailsResponse.data.lastName,
            email: userDetailsResponse.data.email
        });
        setIsLoading(false);
        
    }catch(error){
        Alert.alert('Error', 'Failed to fetch user details.');
    }
  }

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to disconnect?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async() => {
          await AsyncStorage.removeItem('token');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }},
      ]
    );
  };

  if (isLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Scanning network...</Text>
        </View>
      );
    }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>AS</Text>
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.userName}>{userData.firstName} {userData.lastName}</Text>
          <Text style={styles.userRole}>{userData.role}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>
          <View style={styles.infoCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👤</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{userData.firstName} {userData.lastName}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✉️</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{userData.email}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.securityActionCard} 
            onPress={() => navigation.navigate('Verification', { email: userData.email, flow: "changePassword" })}
            activeOpacity={0.7}
            >
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔒</Text>
            </View>
            <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Security</Text>
                <Text style={styles.actionText}>Change Password</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        </View>
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>EDIT PROFILE DETAILS</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutBtnText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#38bdf8',
    position: 'relative',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  onlineBadge: {
    width: 20,
    height: 20,
    backgroundColor: '#22c55e',
    borderRadius: 10,
    position: 'absolute',
    bottom: 5,
    right: 5,
    borderWidth: 3,
    borderColor: '#1e293b',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: '#38bdf8',
    letterSpacing: 1,
    fontWeight: '600',
  },

  infoSection: {
    paddingHorizontal: 25,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 20,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#f1f5f9',
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: 25,
    marginTop: 20,
  },
  editBtn: {
    backgroundColor: '#38bdf8',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  editBtnText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logoutBtn: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  securityActionCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38bdf8',
    },
    actionText: {
    fontSize: 16,
    color: '#38bdf8', 
    fontWeight: 'bold',
    },
    arrowIcon: {
    color: '#38bdf8',
    fontSize: 20,
    fontWeight: 'bold',
    }
});

export default UserProfile;