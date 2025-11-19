import { supabase } from '@/utils/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

interface Garage {
    id: string;
    name: string;
}

export default function AddVehicle() {
    const router = useRouter();
    const { garageId } = useLocalSearchParams();

    const [formData, setFormData] = useState({
        make: '',
        model: '',
        production_year: '',
        tire_type: '',
        last_service: '',
        availability: true,
        garage_id: garageId as string || ''
    });

    const [garages, setGarages] = useState<Garage[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingGarages, setLoadingGarages] = useState(true);

    useEffect(() => {
        fetchGarages();
        if (garageId) {
            setFormData(prev => ({ ...prev, garage_id: String(garageId) }));
        }
    }, [garageId]);

    const fetchGarages = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('User error:', userError);
                setLoadingGarages(false);
                return;
            }

            const { data, error } = await supabase
                .from('garages')
                .select('id, name')
                .eq('user_id', user.id)
                .order('name');

            if (error) {
                console.error('Error fetching garages:', error);
                await createDefaultGarage(user.id);
                return;
            }

            if (!data || data.length === 0) {
                await createDefaultGarage(user.id);
            } else {
                setGarages(data);
                if (!garageId && data.length > 0) {
                    setFormData(prev => ({ ...prev, garage_id: data[0].id }));
                }
            }

        } catch (error) {
            console.error('Fetch garages error:', error);
            await createDefaultGarage();
        } finally {
            setLoadingGarages(false);
        }
    };

    const createDefaultGarage = async (userId?: string) => {
        try {
            if (!userId) {
                const { data: { user } } = await supabase.auth.getUser();
                userId = user?.id;
            }

            if (!userId) return;

            const { data, error } = await supabase
                .from('garages')
                .insert([{
                    name: 'My Garage',
                    user_id: userId,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating default garage:', error);
                return;
            }

            if (data) {
                setGarages([data]);
                setFormData(prev => ({ ...prev, garage_id: data.id }));
            }
        } catch (error) {
            console.error('Error creating default garage:', error);
        }
    };

    const createNewGarage = async () => {
        if (Platform.OS === 'ios') {
            Alert.prompt(
                'Create New Garage',
                'Enter garage name:',
                async (garageName) => {
                    if (!garageName?.trim()) return;

                    try {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) return;

                        const { data, error } = await supabase
                            .from('garages')
                            .insert([{
                                name: garageName.trim(),
                                user_id: user.id,
                                created_at: new Date().toISOString()
                            }])
                            .select()
                            .single();

                        if (error) {
                            Alert.alert('Error', 'Failed to create garage');
                            return;
                        }

                        setGarages(prev => [...prev, data]);
                        setFormData(prev => ({ ...prev, garage_id: data.id }));
                        Alert.alert('Success', 'Garage created successfully!');
                    } catch (error) {
                        Alert.alert('Error', 'Failed to create garage');
                    }
                }
            );
        } else {
            Alert.alert(
                'Create New Garage',
                'Garage creation via prompt is only supported on iOS. Please create a garage from the Garages screen.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.make.trim()) {
            Alert.alert('Error', 'Please enter the vehicle make');
            return false;
        }
        if (!formData.model.trim()) {
            Alert.alert('Error', 'Please enter the vehicle model');
            return false;
        }
        if (!formData.production_year.trim()) {
            Alert.alert('Error', 'Please enter the production year');
            return false;
        }
        if (isNaN(Number(formData.production_year)) || Number(formData.production_year) < 1900 || Number(formData.production_year) > new Date().getFullYear() + 1) {
            Alert.alert('Error', 'Please enter a valid production year');
            return false;
        }
        if (!formData.tire_type.trim()) {
            Alert.alert('Error', 'Please enter the tire type');
            return false;
        }
        if (!formData.last_service.trim()) {
            Alert.alert('Error', 'Please enter the last service date');
            return false;
        }
        if (!formData.garage_id) {
            Alert.alert('Error', 'Please select a garage');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                Alert.alert('Error', 'You must be logged in to add a vehicle');
                setLoading(false);
                return;
            }

            const carPayload = {
                garage_id: formData.garage_id,
                make: formData.make.trim(),
                model: formData.model.trim(),
                production_year: parseInt(formData.production_year),
                tire_type: formData.tire_type.trim(),
                last_service: formData.last_service,
                availability: formData.availability,
                created_at: new Date().toISOString()
            };

            const { data: carData, error: carError } = await supabase
                .from('cars')
                .insert([carPayload])
                .select()
                .single();

            if (carError) {
                console.error('Car insert error:', carError);
                Alert.alert('Database Error', `Failed to add vehicle: ${carError.message}`);
                setLoading(false);
                return;
            }

            router.replace('/(tabs)/dashboard');
            Alert.alert('Success', 'Vehicle added successfully!', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]);

        } catch (error: any) {
            console.error('Submit error:', error);
            Alert.alert('Error', `Something went wrong: ${error?.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    if (loadingGarages) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingIcon}>
                    <Text style={styles.loadingEmoji}>🚗</Text>
                </View>
                <Text style={styles.loadingText}>Loading garages...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Text style={styles.backButtonText}>←</Text>
                        </TouchableOpacity>
                        <View style={styles.headerIcon}>
                            <Text style={styles.headerIconText}>🚗</Text>
                        </View>
                    </View>
                    <Text style={styles.headerTitle}>Add Vehicle</Text>
                    <Text style={styles.headerSubtitle}>Register a new vehicle to your garage</Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    {garages.length > 0 && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#eef9ff' }]}>
                                        <Text style={styles.iconText}>🏠</Text>
                                    </View>
                                    <Text style={styles.cardTitle}>Select Garage</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={createNewGarage}
                                    style={styles.newButton}
                                >
                                    <Text style={styles.newButtonText}>+ New</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.garageScroll}>
                                <View style={styles.garageContainer}>
                                    {garages.map((garage) => (
                                        <TouchableOpacity
                                            key={garage.id}
                                            onPress={() => handleInputChange('garage_id', garage.id)}
                                            style={[
                                                styles.garageCard,
                                                formData.garage_id === garage.id && styles.garageCardSelected
                                            ]}
                                        >
                                            <Text style={[
                                                styles.garageCardText,
                                                formData.garage_id === garage.id && styles.garageCardTextSelected
                                            ]}>
                                                {garage.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}

                    {garages.length === 0 && (
                        <View style={[styles.card, styles.emptyCard]}>
                            <View style={styles.emptyIcon}>
                                <Text style={styles.emptyIconText}>🏠</Text>
                            </View>
                            <Text style={styles.emptyTitle}>No Garages Found</Text>
                            <Text style={styles.emptyText}>
                                You need to create a garage first before adding vehicles
                            </Text>
                            <TouchableOpacity
                                onPress={createNewGarage}
                                style={styles.createButton}
                            >
                                <Text style={styles.createButtonText}>Create First Garage</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Vehicle Information */}
                    <View style={styles.card}>
                        <View style={styles.cardSectionHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: '#eef9ff' }]}>
                                <Text style={styles.iconText}>ℹ️</Text>
                            </View>
                            <Text style={styles.cardTitle}>Vehicle Information</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Make</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.make}
                                onChangeText={(text) => handleInputChange('make', text)}
                                placeholder="Toyota, BMW, Audi"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Model</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.model}
                                onChangeText={(text) => handleInputChange('model', text)}
                                placeholder="Camry, X5, A4"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Production Year</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.production_year}
                                onChangeText={(text) => handleInputChange('production_year', text)}
                                placeholder="2020"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Service Details */}
                    <View style={styles.card}>
                        <View style={styles.cardSectionHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: '#fef3e6' }]}>
                                <Text style={styles.iconText}>🔧</Text>
                            </View>
                            <Text style={styles.cardTitle}>Service Details</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tire Type</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.tire_type}
                                onChangeText={(text) => handleInputChange('tire_type', text)}
                                placeholder="All-Season, Winter, Summer"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Last Service Date</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.last_service}
                                onChangeText={(text) => handleInputChange('last_service', text)}
                                placeholder="2025-01-15"
                                placeholderTextColor="#9ca3af"
                            />
                            <Text style={styles.helperText}>Format: YYYY-MM-DD</Text>
                        </View>
                    </View>

                    {/* Availability Status */}
                    <View style={styles.card}>
                        <View style={styles.cardSectionHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: '#ecfdf5' }]}>
                                <Text style={styles.iconText}>✓</Text>
                            </View>
                            <Text style={styles.cardTitle}>Availability Status</Text>
                        </View>

                        <View style={styles.availabilityContainer}>
                            <TouchableOpacity
                                onPress={() => handleInputChange('availability', true)}
                                style={[
                                    styles.availabilityCard,
                                    formData.availability && styles.availabilityCardSelected
                                ]}
                            >
                                <View style={styles.availabilityContent}>
                                    <View style={[
                                        styles.availabilityIcon,
                                        formData.availability && styles.availabilityIconSelected
                                    ]}>
                                        <Text style={styles.availabilityCheck}>✓</Text>
                                    </View>
                                    <Text style={[
                                        styles.availabilityText,
                                        formData.availability && styles.availabilityTextSelected
                                    ]}>
                                        Available
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.availabilitySubtext,
                                    formData.availability && styles.availabilitySubtextSelected
                                ]}>
                                    Ready to use
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleInputChange('availability', false)}
                                style={[
                                    styles.availabilityCard,
                                    !formData.availability && styles.availabilityCardUnavailable
                                ]}
                            >
                                <View style={styles.availabilityContent}>
                                    <View style={[
                                        styles.availabilityIcon,
                                        !formData.availability && styles.availabilityIconUnavailable
                                    ]}>
                                        <Text style={styles.availabilityCheck}>✕</Text>
                                    </View>
                                    <Text style={[
                                        styles.availabilityText,
                                        !formData.availability && styles.availabilityTextUnavailable
                                    ]}>
                                        Not Available
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.availabilitySubtext,
                                    !formData.availability && styles.availabilitySubtextUnavailable
                                ]}>
                                    Under maintenance
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Info Banner */}
                    <View style={styles.infoBanner}>
                        <View style={styles.infoBannerHeader}>
                            <View style={styles.infoIcon}>
                                <Text style={styles.infoIconText}>i</Text>
                            </View>
                            <Text style={styles.infoBannerTitle}>Important Information</Text>
                        </View>
                        <Text style={styles.infoBannerText}>
                            Make sure all vehicle information is accurate. This data will be used for maintenance tracking and availability management.
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading || garages.length === 0}
                            style={[
                                styles.submitButton,
                                (loading || garages.length === 0) && styles.submitButtonDisabled
                            ]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Add Vehicle</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingIcon: {
        width: 64,
        height: 64,
        backgroundColor: '#0b6b8a',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    loadingEmoji: {
        fontSize: 24,
        color: '#fff',
    },
    loadingText: {
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        backgroundColor: '#0b6b8a',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 18,
        color: '#fff',
    },
    headerIcon: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIconText: {
        fontSize: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    formContainer: {
        padding: 16,
        marginTop: -16,
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
    emptyCard: {
        alignItems: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
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
    newButton: {
        backgroundColor: '#eef9ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    newButtonText: {
        color: '#0b6b8a',
        fontSize: 12,
        fontWeight: '600',
    },
    garageScroll: {
        marginHorizontal: -4,
    },
    garageContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 4,
    },
    garageCard: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        backgroundColor: '#f8fafc',
        minWidth: 120,
    },
    garageCardSelected: {
        backgroundColor: '#eef9ff',
        borderColor: '#0b6b8a',
    },
    garageCardText: {
        textAlign: 'center',
        fontWeight: '500',
        color: '#6b7280',
    },
    garageCardTextSelected: {
        color: '#0b6b8a',
    },
    emptyIcon: {
        width: 64,
        height: 64,
        backgroundColor: '#f1f5f9',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyIconText: {
        fontSize: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f1724',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: '#0b6b8a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    createButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        width: '100%',
        height: 52,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#0f1724',
    },
    helperText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    availabilityContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    availabilityCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        backgroundColor: '#f8fafc',
    },
    availabilityCardSelected: {
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
    },
    availabilityCardUnavailable: {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
    },
    availabilityContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    availabilityIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    availabilityIconSelected: {
        backgroundColor: '#10b981',
    },
    availabilityIconUnavailable: {
        backgroundColor: '#ef4444',
    },
    availabilityCheck: {
        fontSize: 12,
        color: '#fff',
    },
    availabilityText: {
        fontWeight: '500',
        color: '#6b7280',
    },
    availabilityTextSelected: {
        color: '#10b981',
    },
    availabilityTextUnavailable: {
        color: '#ef4444',
    },
    availabilitySubtext: {
        fontSize: 12,
        textAlign: 'center',
        color: '#9ca3af',
    },
    availabilitySubtextSelected: {
        color: '#10b981',
    },
    availabilitySubtextUnavailable: {
        color: '#ef4444',
    },
    infoBanner: {
        backgroundColor: '#eef9ff',
        borderWidth: 1,
        borderColor: '#bae6fd',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    infoBannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoIcon: {
        width: 24,
        height: 24,
        backgroundColor: '#0b6b8a',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    infoIconText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    infoBannerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0b6b8a',
    },
    infoBannerText: {
        fontSize: 12,
        color: '#0b6b8a',
        lineHeight: 18,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 24,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '500',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 24,
        backgroundColor: '#0b6b8a',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
