import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import BackendApi from '../../api/BackendApi';

const VerificationScreen = ({ route, navigation }) => {
  const [code, setCode] = useState('');
  const { email } = route.params;

  useEffect(() => {
    sendVerificationCode();
  }, [])

  const sendVerificationCode = async () => {
    try{

      const verificationCodeSentResponse = await BackendApi.post('/user/send-verification-code', {
          email: email
      })
      
      Alert.alert(verificationCodeSentResponse.data.message);
    }catch(error){
      Alert.alert('Error', 'Failed to send verification code.');
      navigation.goBack();
    }
  }

  const verifyCode = async () => {
    try{
      const verifyCodeResponse = await BackendApi.post('/user/verify-verification-code', {
        email: email,
        code: code
      })

      navigation.reset({
            index: 0,
            routes: [{ name: 'changePassword', params: { email: email } }],
          });
      
    }catch(error){
      Alert.alert('Error', 'Failed to verify code.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
        <View style={styles.content}>
          
          <Text style={styles.icon}>✉️</Text>
          <Text style={styles.title}>Check your Email</Text>
          <Text style={styles.subtitle}>
            We sent a verification code to {"\n"}
            <Text style={styles.emailHighlight}>{ email }</Text>
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.codeInput}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor="#334155"
              onChangeText={setCode}
              value={code}
              autoFocus={true}
            />
          </View>

          <TouchableOpacity style={styles.verifyBtn} onPress={() => {verifyCode()}}>
            <Text style={styles.verifyBtnText}>VERIFY CODE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive it? <Text style={styles.resendLink} onPress={() => {sendVerificationCode()}}>Resend</Text></Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  
  icon: { fontSize: 50, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  emailHighlight: { color: '#38bdf8', fontWeight: 'bold' },

  inputContainer: { width: '100%', marginBottom: 30 },
  codeInput: {
    backgroundColor: '#1e293b',
    height: 70,
    borderRadius: 16,
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 10,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },

  verifyBtn: {
    width: '100%',
    backgroundColor: '#38bdf8',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyBtnText: { color: '#0f172a', fontSize: 16, fontWeight: 'bold' },
  
  resendContainer: { padding: 10 },
  resendText: { color: '#94a3b8' },
  resendLink: { color: '#38bdf8', fontWeight: 'bold' },
});

export default VerificationScreen;