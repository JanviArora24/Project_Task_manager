import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, toggleTheme } from '../redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios'; 
import { router, Stack } from 'expo-router';

// 🎨 Global Theme Colors
const getTheme = (isDark: boolean) => ({
    bg: isDark ? '#111827' : '#F9FAFB',
    surface: isDark ? '#1F2937' : '#FFFFFF',
    textMain: isDark ? '#F9FAFB' : '#111827',
    textSub: isDark ? '#9CA3AF' : '#6B7280',
    primary: isDark ? '#818CF8' : '#4F46E5',
    border: isDark ? '#374151' : '#E5E7EB',
    inputBg: isDark ? '#374151' : '#F9FAFB',
    inputText: isDark ? '#FFFFFF' : '#111827',
});

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const dispatch = useDispatch();
    const isDark = useSelector((state: any) => state.auth.isDark);
    const theme = getTheme(isDark);

    const handleSendOTP = async () => {
        if (!phone) return alert("Please enter a valid phone number");
        setLoading(true);
        try {
            await api.post('/auth/login', { phone_number: phone });
            setStep(2);
        } catch (error) { alert("Failed to send OTP"); }
        setLoading(false);
    };

    const handleVerifyOTP = async () => {
        if (!otp) return alert("Please enter OTP");
        setLoading(true);
        try {
            const response = await api.post('/auth/verify', { phone_number: phone, otp });
            await AsyncStorage.setItem('token', response.data.token);
            dispatch(loginSuccess({ user: response.data.user, token: response.data.token }));
            router.replace('/dashboard');
        } catch (error) { alert("Invalid OTP"); }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: theme.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={{ position: 'absolute', top: 50, right: 20 }}>
                <IconButton icon={isDark ? "weather-sunny" : "moon-waning-crescent"} iconColor={theme.textMain} size={28} onPress={() => dispatch(toggleTheme())} />
            </View>

            <View style={styles.brandContainer}>
                <View style={[styles.logoCircle, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                    <Text style={styles.logoText}>B</Text>
                </View>
                <Text variant="displaySmall" style={[styles.title, { color: theme.textMain }]}>BlissTasks</Text>
                <Text variant="bodyLarge" style={{ color: theme.textSub, marginTop: 4 }}>Manage your work effortlessly</Text>
            </View>

            <Surface style={[styles.card, { backgroundColor: theme.surface }]} elevation={2}>
                <Text variant="titleMedium" style={[styles.cardHeader, { color: theme.textMain }]}>
                    {step === 1 ? "Sign in to your account" : "Enter Verification Code"}
                </Text>
                
                {step === 1 ? (
                    <View>
                        <TextInput
                            mode="outlined" placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad"
                            style={[styles.input, { backgroundColor: theme.inputBg }]}
                            textColor={theme.inputText} outlineColor={theme.border} activeOutlineColor={theme.primary}
                            left={<TextInput.Icon icon="phone-outline" color={theme.textSub} />}
                        />
                        <Button mode="contained" onPress={handleSendOTP} loading={loading} style={[styles.button, { backgroundColor: theme.primary }]} labelStyle={styles.buttonText}>
                            Continue
                        </Button>
                    </View>
                ) : (
                    <View>
                        <TextInput
                            mode="outlined" placeholder="6-digit OTP (mock eg 123456)" value={otp} onChangeText={setOtp} keyboardType="number-pad" secureTextEntry
                            style={[styles.input, { backgroundColor: theme.inputBg }]}
                            textColor={theme.inputText} outlineColor={theme.border} activeOutlineColor={theme.primary}
                            left={<TextInput.Icon icon="lock-outline" color={theme.textSub} />}
                        />
                        <Button mode="contained" onPress={handleVerifyOTP} loading={loading} style={[styles.button, { backgroundColor: theme.primary }]} labelStyle={styles.buttonText}>
                            Verify & Login
                        </Button>
                        <Button mode="text" onPress={() => setStep(1)} textColor={theme.textSub} style={{marginTop: 8}}>
                            Wrong number? Go back
                        </Button>
                    </View>
                )}
            </Surface>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24 },
    brandContainer: { alignItems: 'center', marginBottom: 40 },
    logoCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    logoText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
    title: { fontWeight: '900', letterSpacing: -0.5 },
    card: { padding: 24, borderRadius: 24 },
    cardHeader: { fontWeight: '600', marginBottom: 20, textAlign: 'center' },
    input: { marginBottom: 20, fontSize: 16 },
    button: { borderRadius: 12, paddingVertical: 6 },
    buttonText: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});