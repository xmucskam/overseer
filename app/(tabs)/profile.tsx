import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfirmationModal from '../../components/welcome/ConfirmationModal';
import { supabase } from '../../utils/supabase';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    subscription_tier?: 'free' | 'enthusiast' | 'business';
  };
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [garagesCount, setGaragesCount] = useState(0);
  const [carsCount, setCarsCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchStats();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user as User);
        fetchStats();
      } else {
        setUser(null);
        setGaragesCount(0);
        setCarsCount(0);
        // Navigate to welcome screen when user signs out
        if (event === 'SIGNED_OUT') {
          router.replace('/screens/welcome');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user as User);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch garages count
      const { data: garages, error: garageError } = await supabase
        .from('garages')
        .select('id')
        .eq('user_id', user.id);

      if (garageError) {
        console.error('Error fetching garages:', garageError);
        return;
      }

      const garageCount = garages?.length || 0;
      setGaragesCount(garageCount);

      // Fetch total cars count across all garages
      if (garageCount > 0) {
        const garageIds = garages.map(g => g.id);
        const { data: cars, error: carError } = await supabase
          .from('cars')
          .select('id')
          .in('garage_id', garageIds);

        if (carError) {
          console.error('Error fetching cars:', carError);
          return;
        }

        setCarsCount(cars?.length || 0);
      } else {
        setCarsCount(0);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getTierDisplay = (tier?: string) => {
    switch (tier) {
      case 'free':
        return 'Free';
      case 'enthusiast':
        return 'Enthusiast';
      case 'business':
        return 'Business';
      default:
        return 'Free';
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'free':
        return '#6b7280';
      case 'enthusiast':
        return '#0b6b8a';
      case 'business':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  const getTierLimits = (tier?: string) => {
    switch (tier) {
      case 'free':
        return { garages: 1, cars: 2 };
      case 'enthusiast':
        return { garages: 5, cars: 20 }; // Placeholder values
      case 'business':
        return { garages: -1, cars: -1 }; // -1 means unlimited
      default:
        return { garages: 1, cars: 2 }; // Default to free tier limits
    }
  };

  const handleLogout = () => {
    console.log('Logging out - handleLogout called');
    // Show custom confirmation modal instead of Alert
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    console.log('Logout confirmed by user');
    setShowLogoutModal(false);
    await performLogout();
  };

  const handleLogoutCancel = () => {
    console.log('Logout cancelled by user');
    setShowLogoutModal(false);
  };

  const performLogout = async () => {
    console.log('performLogout called');
    setLogoutLoading(true);
    try {
      console.log('Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      console.log('signOut completed, error:', error);
      
      if (error) {
        console.error('SignOut error:', error);
        Alert.alert('Error', 'Failed to log out. Please try again.');
        setLogoutLoading(false);
        return;
      }
      
      console.log('Sign out successful, navigating to welcome screen...');
      // Navigate to welcome screen
      router.replace('/screens/welcome');
      console.log('Navigation to welcome screen completed');
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0b6b8a" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and settings</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>🏠</Text>
              <Text style={styles.statLabel}>Garages</Text>
            </View>
            {(() => {
              const limits = getTierLimits(user?.user_metadata?.subscription_tier);
              const maxGarages = limits.garages;
              const isAtLimit = maxGarages > 0 && garagesCount >= maxGarages;
              return (
                <>
                  <Text style={[styles.statValue, { color: isAtLimit ? '#ef4444' : '#6366f1' }]}>
                    {garagesCount}
                  </Text>
                  {maxGarages > 0 && (
                    <Text style={[styles.statLimit, { color: isAtLimit ? '#ef4444' : '#6b7280' }]}>
                      / {maxGarages}
                    </Text>
                  )}
                </>
              );
            })()}
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>🚗</Text>
              <Text style={styles.statLabel}>Vehicles</Text>
            </View>
            {(() => {
              const limits = getTierLimits(user?.user_metadata?.subscription_tier);
              const maxCars = limits.cars;
              const isAtLimit = maxCars > 0 && carsCount >= maxCars;
              return (
                <>
                  <Text style={[styles.statValue, { color: isAtLimit ? '#ef4444' : '#0b6b8a' }]}>
                    {carsCount}
                  </Text>
                  {maxCars > 0 && (
                    <Text style={[styles.statLimit, { color: isAtLimit ? '#ef4444' : '#6b7280' }]}>
                      / {maxCars}
                    </Text>
                  )}
                </>
              );
            })()}
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statLabel}>Tier</Text>
            </View>
            <Text style={[styles.statValue, { color: getTierColor(user?.user_metadata?.subscription_tier) }]}>
              {getTierDisplay(user?.user_metadata?.subscription_tier)}
            </Text>
          </View>
        </View>

        {/* User Info Section */}
        <View style={styles.card}>
          <View style={styles.cardSectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#eef9ff' }]}>
              <Text style={styles.iconText}>👤</Text>
            </View>
            <Text style={styles.cardTitle}>Account Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.email || 'Not available'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.id ? `${user.id.substring(0, 8)}...` : 'Not available'}
            </Text>
          </View>

          {user?.user_metadata?.full_name && (
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>
                {user.user_metadata.full_name}
              </Text>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.card}>
          <View style={styles.cardSectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#fef3e6' }]}>
              <Text style={styles.iconText}>⚙️</Text>
            </View>
            <Text style={styles.cardTitle}>Settings</Text>
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Text style={styles.settingValue}>Enabled</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🎨</Text>
              <Text style={styles.settingLabel}>Theme</Text>
            </View>
            <Text style={styles.settingValue}>Light</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.settingItemLast]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌐</Text>
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <Text style={styles.settingValue}>English</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={logoutLoading}
        >
          {logoutLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.logoutButtonText}>Log Out</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        confirmButtonStyle="destructive"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f1724',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f1724',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f1724',
  },
  settingValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLimit: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
});

