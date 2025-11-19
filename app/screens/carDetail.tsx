import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StatusBar,
    StyleSheet,
    Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';

// @ts-ignore
import StaticCarImage from '@/assets/images/carTypes/removebg/sedan.png';

interface VehicleDetails {
    tire_type: string;
    last_service: string;
    availability: boolean;
}

interface CarData {
    id: string;
    make: string;
    model: string;
    production_year: string;
    created_at: string;
    garage_id: string;
    cars?: VehicleDetails | null;
}

interface GarageInfo {
    id: string;
    name: string;
}

export default function CarDetail() {
    const { carId, carData } = useLocalSearchParams();
    const [car, setCar] = useState<CarData | null>(null);
    const [garage, setGarage] = useState<GarageInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingAvailability, setUpdatingAvailability] = useState(false);

    useEffect(() => {
        if (carData) {
            try {
                const parsedCar = JSON.parse(carData as string);
                setCar(parsedCar);
                fetchGarageInfo(parsedCar.garage_id);
            } catch (error) {
                console.error('Error parsing car data:', error);
                Alert.alert('Error', 'Failed to load car details');
                router.back();
            }
        }
        setLoading(false);
    }, [carData]);

    const fetchGarageInfo = async (garageId: string) => {
        try {
            const { data, error } = await supabase
                .from('garages')
                .select('id, name')
                .eq('id', garageId)
                .single();

            if (error) {
                console.error('Error fetching garage info:', error);
                return;
            }

            setGarage(data);
        } catch (error) {
            console.error('Error fetching garage info:', error);
        }
    };

    const toggleAvailability = async () => {
        if (!car) return;

        setUpdatingAvailability(true);
        try {
            const newAvailability = !car.cars?.availability;

            const { error } = await supabase
                .from('cars')
                .update({ availability: newAvailability })
                .eq('id', car.id);

            if (error) {
                console.error('Error updating availability:', error);
                Alert.alert('Error', 'Failed to update availability');
                return;
            }

            setCar(prev => ({
                ...prev!,
                cars: {
                    ...prev!.cars!,
                    availability: newAvailability,
                },
            }));

            Alert.alert(
                'Success',
                `Vehicle is now ${newAvailability ? 'available' : 'unavailable'}`
            );
        } catch (error) {
            console.error('Error updating availability:', error);
            Alert.alert('Error', 'Failed to update availability');
        } finally {
            setUpdatingAvailability(false);
        }
    };

    const handleEdit = () => {
        router.push({
            pathname: '../screens/editVehicle',
            params: {
                carId: car?.id,
                carData: JSON.stringify(car),
            }
        });
    };

    const handleEditField = (field: string) => {
        router.push({
            pathname: '../screens/editVehicle',
            params: {
                carId: car?.id,
                carData: JSON.stringify(car),
                editField: field,
            }
        });
    };

    const handleDelete = async () => {
        if (!car) return;

        Alert.alert(
            'Delete Vehicle',
            'Are you sure you want to delete this vehicle? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('cars')
                                .delete()
                                .eq('id', car.id);

                            if (error) {
                                console.error('Error deleting car:', error);
                                Alert.alert('Error', 'Failed to delete vehicle');
                                return;
                            }

                            router.replace('/(tabs)/dashboard');
                        } catch (error) {
                            console.error('Error deleting car:', error);
                            Alert.alert('Error', 'Failed to delete vehicle');
                        }
                    },
                },
            ]
        );
    };

    if (loading || !car) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0b6b8a" />
                <Text style={styles.loadingText}>Loading vehicle details...</Text>
            </View>
        );
    }

    const carDetail = car.cars;
    const isAvailable = carDetail?.availability;
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - parseInt(car.production_year);
    const isModern = carAge <= 10;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.headerButton}
                    >
                        <Ionicons name="arrow-back" size={20} color="#475569" />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={handleEdit}
                            style={styles.headerButton}
                        >
                            <Ionicons name="pencil" size={18} color="#475569" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDelete}
                            style={[styles.headerButton, styles.deleteButton]}
                        >
                            <Ionicons name="trash-outline" size={18} color="#e11d48" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Vehicle Profile */}
                <View style={styles.profileSection}>
                    <View style={styles.carImageContainer}>
                        <Image
                            source={StaticCarImage}
                            style={styles.carImage}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.carName}>
                            {car.make} {car.model}
                        </Text>
                        <Text style={styles.carSubtext}>
                            {car.production_year} • {garage?.name || 'Garage'}
                        </Text>

                        <TouchableOpacity
                            onPress={toggleAvailability}
                            disabled={updatingAvailability}
                            style={[
                                styles.statusBadge,
                                isAvailable ? styles.statusBadgeAvailable : styles.statusBadgeUnavailable
                            ]}
                        >
                            {updatingAvailability ? (
                                <ActivityIndicator size="small" color={isAvailable ? '#10b981' : '#ef4444'} />
                            ) : (
                                <Text style={[
                                    styles.statusBadgeText,
                                    isAvailable ? styles.statusBadgeTextAvailable : styles.statusBadgeTextUnavailable
                                ]}>
                                    {isAvailable ? 'Available' : 'Unavailable'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Vehicle Details */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: '#eef9ff' }]}>
                            <Ionicons name="car-sport" size={20} color="#0b6b8a" />
                        </View>
                        <Text style={styles.sectionTitle}>Vehicle Details</Text>
                    </View>

                    <View style={styles.sectionContent}>
                        <View style={styles.detailCard}>
                            <View style={styles.detailCardHeader}>
                                <Text style={styles.detailLabel}>Make & Model</Text>
                                <TouchableOpacity onPress={() => handleEditField('makeModel')}>
                                    <Ionicons name="pencil" size={16} color="#0b6b8a" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.detailValue}>
                                {car.make} {car.model}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={[styles.detailCard, styles.detailCardHalf]}>
                                <View style={styles.detailCardHeader}>
                                    <Text style={styles.detailLabel}>Year</Text>
                                    <TouchableOpacity onPress={() => handleEditField('production_year')}>
                                        <Ionicons name="pencil" size={16} color="#0b6b8a" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.detailValue}>{car.production_year}</Text>
                                <Text style={[styles.detailSubtext, isModern && styles.detailSubtextModern]}>
                                    {carAge} yrs{isModern ? ' • Modern' : ''}
                                </Text>
                            </View>

                            <View style={[styles.detailCard, styles.detailCardHalf]}>
                                <View style={styles.detailCardHeader}>
                                    <Text style={styles.detailLabel}>Tire Type</Text>
                                    <TouchableOpacity onPress={() => handleEditField('tire_type')}>
                                        <Ionicons name="pencil" size={16} color="#0b6b8a" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.detailValue}>
                                    {carDetail?.tire_type || 'Not set'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Service Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: '#ecfdf5' }]}>
                            <Ionicons name="build" size={20} color="#10b981" />
                        </View>
                        <Text style={styles.sectionTitle}>Service History</Text>
                    </View>

                    <View style={styles.sectionContent}>
                        <View style={styles.detailCard}>
                            <View style={styles.detailCardHeader}>
                                <Text style={styles.detailLabel}>Last Service Date</Text>
                                <TouchableOpacity onPress={() => handleEditField('last_service')}>
                                    <Ionicons name="pencil" size={16} color="#10b981" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.detailValue}>
                                {carDetail?.last_service
                                    ? new Date(carDetail.last_service).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })
                                    : 'No service record'}
                            </Text>
                        </View>

                        <View style={styles.detailCard}>
                            <View style={styles.detailCardHeader}>
                                <Text style={styles.detailLabel}>Added to Fleet</Text>
                                <TouchableOpacity onPress={() => handleEditField('created_at')}>
                                    <Ionicons name="pencil" size={16} color="#10b981" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.detailValue}>
                                {new Date(car.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsSection}>
                    <View style={styles.statsHeader}>
                        <View style={[styles.statsIcon, { backgroundColor: '#e0f2fe' }]}>
                            <Ionicons name="analytics" size={18} color="#0b6b8a" />
                        </View>
                        <Text style={styles.statsTitle}>Quick Stats</Text>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#e0f2fe' }]}>
                                <Ionicons name="calendar-outline" size={22} color="#0b6b8a" />
                            </View>
                            <Text style={styles.statValue}>{carAge}</Text>
                            <Text style={styles.statLabel}>Years Old</Text>
                        </View>

                        <View style={[
                            styles.statCard,
                            isAvailable ? styles.statCardAvailable : styles.statCardUnavailable
                        ]}>
                            <View style={[
                                styles.statIcon,
                                isAvailable ? { backgroundColor: '#ecfdf5' } : { backgroundColor: '#fef2f2' }
                            ]}>
                                <Ionicons
                                    name={isAvailable ? "checkmark-circle" : "close-circle"}
                                    size={22}
                                    color={isAvailable ? "#10b981" : "#ef4444"}
                                />
                            </View>
                            <Text style={[
                                styles.statValue,
                                isAvailable ? styles.statValueAvailable : styles.statValueUnavailable
                            ]}>
                                {isAvailable ? 'Yes' : 'No'}
                            </Text>
                            <Text style={styles.statLabel}>Available</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                    <Text style={styles.actionsTitle}>Quick Actions</Text>
                    <View style={styles.actionsList}>
                        <TouchableOpacity
                            onPress={handleEdit}
                            style={styles.actionCard}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#eef9ff' }]}>
                                <Ionicons name="pencil" size={22} color="#0b6b8a" />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={styles.actionTitle}>Edit Vehicle Details</Text>
                                <Text style={styles.actionSubtitle}>Update vehicle information</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => Alert.alert('Coming Soon', 'Service history feature will be available soon')}
                            style={styles.actionCard}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#fef3e6' }]}>
                                <Ionicons name="build" size={22} color="#f59e0b" />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={styles.actionTitle}>Service History</Text>
                                <Text style={styles.actionSubtitle}>View maintenance records</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => Alert.alert('Coming Soon', 'Share feature will be available soon')}
                            style={styles.actionCard}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#ecfdf5' }]}>
                                <Ionicons name="share-outline" size={22} color="#10b981" />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={styles.actionTitle}>Share Vehicle</Text>
                                <Text style={styles.actionSubtitle}>Share vehicle details</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerButton: {
        width: 36,
        height: 36,
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        backgroundColor: '#fef2f2',
        marginLeft: 8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    carImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    carImage: {
        width: '75%',
        height: '75%',
    },
    profileInfo: {
        flex: 1,
    },
    carName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0f1724',
        marginBottom: 4,
    },
    carSubtext: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 12,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusBadgeAvailable: {
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
    },
    statusBadgeUnavailable: {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadgeTextAvailable: {
        color: '#10b981',
    },
    statusBadgeTextUnavailable: {
        color: '#ef4444',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f1724',
    },
    sectionContent: {
        padding: 20,
    },
    detailCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    detailCardHalf: {
        flex: 1,
        marginHorizontal: 6,
    },
    detailCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f1724',
    },
    detailSubtext: {
        fontSize: 12,
        color: '#f59e0b',
        marginTop: 4,
    },
    detailSubtextModern: {
        color: '#10b981',
    },
    detailRow: {
        flexDirection: 'row',
        marginTop: 12,
    },
    statsSection: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    statsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statsIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f1724',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    statCardAvailable: {
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
    },
    statCardUnavailable: {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0f1724',
        marginBottom: 4,
    },
    statValueAvailable: {
        color: '#10b981',
    },
    statValueUnavailable: {
        color: '#ef4444',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
        textAlign: 'center',
    },
    actionsSection: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 32,
    },
    actionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f1724',
        marginBottom: 16,
    },
    actionsList: {
        gap: 12,
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#0f1724',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
});
