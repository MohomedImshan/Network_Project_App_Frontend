import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import BackendApi from '../../api/BackendApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ route, navigation }) => {
  const [firstName, setFirstName] = useState(route.params.userData.firstName);
  const [lastName, setLastName] = useState(route.params.userData.lastName);
  const [email, setEmail] = useState(route.params.userData.email);

  const handleSave = async() => {
    if (firstName.length === 0 || lastName.length === 0 || email.length === 0) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    try{
        const profileUpdateResponse = await BackendApi.put('/user/profile', {
            firstName: firstName,
            lastName: lastName,
            email: email
        })

        await AsyncStorage.setItem('token', profileUpdateResponse.data.token.token);
        
        Alert.alert(
            'Profile Updated',
            'Your details have been saved successfully.',
            [
                { text: 'OK', onPress: () => navigation.goBack() } // Navigate back to Profile on success
            ]
        );

    }catch(error){
        console.log(error);
        
        Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarInitials}>AS</Text>
              <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </View>
          <View style={styles.formContainer}>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>FIRST NAME</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>LAST NAME</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  cancelText: { color: '#94a3b8', fontSize: 16 },
  saveText: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold' },
  headerTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold' },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#38bdf8',
    position: 'relative',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#38bdf8',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  cameraIcon: { fontSize: 16 },
  changePhotoText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  },

  // Form Styles
  formContainer: {
    marginTop: 10,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1e293b',
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#38bdf8',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  saveBtnText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default EditProfileScreen;