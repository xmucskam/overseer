import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import PopUpModal from '@/components/welcome/PopUpModal';
import RegisterForm from '../../components/welcome/RegisterForm';
import { supabase } from '../../utils/supabase';

export default function OverseeRegister() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [tier, setTier] = useState<'free' | 'enthusiast' | 'business'>('free');

  const handleRegister = async () => {
    console.log('Registering user:', { username, email, password });
    console.log('Selected tier:', tier);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    },
    { data: { subscription_tier: tier } }
    );

    if (error) {
      console.error('Signup error:', error.message);
      alert('Signup failed: ' + error.message);
      return;
    }

    setModalVisible(true);
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleBack = () => {
    router.push('./welcome');
  };

  const tierOptions = [
    { key: 'free' as const, title: 'Free', price: '$0', desc: 'Basic' },
    { key: 'enthusiast' as const, title: 'Enthusiast', price: '$9', desc: 'More features' },
    { key: 'business' as const, title: 'Business', price: '$29', desc: 'Full access' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
        </View>

        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>R</Text>
            <View style={styles.logoCircle}>
              <View style={styles.logoInnerCircle} />
            </View>
            <Text style={styles.logoText}>VERSEE</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to get started</Text>
          </View>

          {/* Subscription Tier Selection */}
          <View style={styles.tierSection}>
            <Text style={styles.tierLabel}>Choose a subscription tier</Text>
            <View style={styles.tierGrid}>
              {tierOptions.map((t) => {
                const isSelected = tier === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => setTier(t.key)}
                    style={[
                      styles.tierCard,
                      isSelected && styles.tierCardSelected,
                    ]}
                  >
                    <Text style={[
                      styles.tierTitle,
                      isSelected && styles.tierTitleSelected,
                    ]}>
                      {t.title}
                    </Text>
                    <Text style={styles.tierDesc}>{t.desc}</Text>
                    <Text style={[
                      styles.tierPrice,
                      isSelected && styles.tierPriceSelected,
                    ]}>
                      {t.price}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <RegisterForm
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onRegister={handleRegister}
            onForgotPassword={handleForgotPassword}
            onBack={handleBack}
          />
        </View>
      </ScrollView>

      <PopUpModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          router.push('./welcome');
        }}
        message="Confirmation Email Has Been Sent!"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#0f1724',
  },
  logoCircle: {
    width: 48,
    height: 48,
    backgroundColor: '#ef4444',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  logoInnerCircle: {
    width: 32,
    height: 32,
    borderWidth: 4,
    borderColor: '#fff',
    borderRadius: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f1724',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  tierSection: {
    marginBottom: 32,
  },
  tierLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  tierGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  tierCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  tierCardSelected: {
    borderColor: '#0b6b8a',
    borderWidth: 2,
    backgroundColor: '#f3fbff',
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  tierTitleSelected: {
    color: '#0b6b8a',
  },
  tierDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f1724',
  },
  tierPriceSelected: {
    color: '#0b6b8a',
  },
});
