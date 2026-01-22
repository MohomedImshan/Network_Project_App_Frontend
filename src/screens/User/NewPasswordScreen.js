import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import BackendApi from '../../api/BackendApi';

const NewPasswordScreen = ({ route, navigation }) => {
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const { email } = route.params;

  const handleUpdatePassword = async() => {
    if(newPass !== confirmPass){
        Alert.alert('Passwords do not match');
        return;
    }

    try{
        const updatePasswordResponse = await BackendApi.put('/user/reset-password',{
            email: email,
            new_password: newPass
        })

        Alert.alert("Success", "Your password has been updated successfully.", [
            { text: 'OK', onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          }) }
        ]);
    }catch(error){
        Alert.alert('Error', 'Failed to update password.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter a strong password for your account.</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>NEW PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={newPass}
            onChangeText={setNewPass}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>CONFIRM PASSWORD</Text>
          <TextInput
            style={[styles.input, newPass === confirmPass && newPass.length > 0 ? styles.matchBorder : null]}
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={confirmPass}
            onChangeText={setConfirmPass}
          />
        </View>

        <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdatePassword}>
          <Text style={styles.confirmBtnText}>UPDATE PASSWORD</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  
  header: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#94a3b8' },

  inputWrapper: { marginBottom: 25 },
  label: { color: '#38bdf8', fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
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
  matchBorder: { borderColor: '#22c55e' },

  confirmBtn: {
    backgroundColor: '#38bdf8',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#38bdf8',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  confirmBtnText: { color: '#0f172a', fontSize: 16, fontWeight: 'bold' },
});

export default NewPasswordScreen;