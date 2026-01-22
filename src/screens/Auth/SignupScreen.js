import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import BackendApi from '../../api/BackendApi.js'

const SignupScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async() => {
    if (!firstName || !lastName|| !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    
    try{
        const signupResponse = await BackendApi.post('/user/signup', {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        })

        if(signupResponse.status == 200){
                Alert.alert(signupResponse.data.message)
                navigation.goBack();
        }

    }catch(error){
       console.log(error)
        Alert.alert(error.response?.data?.detail || 'Something went wrong!')
    }
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => console.log('Go Back')}>
              <Text style={styles.backArrow} onPress={() => {navigation.goBack()}}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Create Access</Text>
            <Text style={styles.subtitle}>Register for network monitoring</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>FIRST NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                placeholderTextColor="#64748b"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>LAST NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor="#64748b"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>WORK EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="admin@network.local"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <TextInput
                style={[
                  styles.input, 
                  (password === confirmPassword && password.length > 0) ? styles.inputSuccess : null
                ]}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.signupBtn} 
              onPress={handleSignup}
              activeOpacity={0.8}
            >
              <Text style={styles.signupBtnText}>REQUEST ACCESS</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an ID?</Text>
            <TouchableOpacity>
              <Text style={styles.loginText} onPress={() => {navigation.goBack()}}> Login Here</Text>
            </TouchableOpacity>
          </View>

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
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },

  headerContainer: {
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  backArrow: {
    color: '#38bdf8',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 5,
  },

  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
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
  inputSuccess: {
    borderColor: '#22c55e', 
  },

  signupBtn: {
    backgroundColor: '#38bdf8',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  signupBtnText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  loginText: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SignupScreen;