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
    Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface Garage {
    id: string;
    name: string;
}

interface CarData {
    id: string;
    make: string;
    model: string;
    production_year: string;
    garage_id: string;
    cars?: {
        tire_type: string;
        last_service: string;
        availability: boolean;
    } | null;
}

export default function EditVehicle() {
    const router = useRouter();
    const { carId, carData, editField } = useLocalSearchParams();

    const [formData, setFormData] = useState({
        make: '',
        model: '',
        production_year: '',
        tire_type: '',
        last_service: '',
        availability: true,
        garage_id: '',
    });

    const [garages, setGarages] = useState<Garage[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingGarages, setLoadingGarages] = useState(true);
    const [originalCar, setOriginalCar] = useState<CarData | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTireModal, setShowTireModal] = useState(false);
    const [customTireType, setCustomTireType] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const tireOptions = ['Winter', 'Summer', 'Semi-Slick'];

    useEffect(() => {
        if (carData) {
            try {
                const parsedCar = JSON.parse(carData as string);
                setOriginalCar(parsedCar);
                const lastService = parsedCar.cars?.last_service || '';
                setFormData({
                    make: parsedCar.make || '',
                    model: parsedCar.model || '',
                    production_year: parsedCar.production_year || '',
                    tire_type: parsedCar.cars?.tire_type || '',
                    last_service: lastService,
                    availability: parsedCar.cars?.availability ?? true,
                    garage_id: parsedCar.garage_id || '',
                });
                if (lastService) {
                    setSelectedDate(new Date(lastService));
                }
            } catch (error) {
                console.error('Error parsing car data:', error);
                Alert.alert('Error', 'Failed to load vehicle data');
                router.back();
            }
        }
        fetchGarages();
    }, [carData]);

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
                return;
            }

            setGarages(data || []);

        } catch (error) {
            console.error('Fetch garages error:', error);
        } finally {
            setLoadingGarages(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTireTypeSelect = (tireType: string) => {
        if (tireType === 'Custom') {
            setShowCustomInput(true);
        } else {
            handleInputChange('tire_type', tireType);
            setShowTireModal(false);
            setShowCustomInput(false);
            setCustomTireType('');
        }
    };

    const handleCustomTireSubmit = () => {
        if (customTireType.trim()) {
            handleInputChange('tire_type', customTireType.trim());
            setShowTireModal(false);
            setShowCustomInput(false);
            setCustomTireType('');
        }
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
            if (Platform.OS === 'android') {
                const formattedDate = date.toISOString().split('T')[0];
                handleInputChange('last_service', formattedDate);
            }
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Select date';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Select date';
        }
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
        // For focused edit view, only validate the field being edited
        if (editField) {
            if (editField === 'makeModel') {
                if (!formData.make.trim() || !formData.model.trim()) {
                    Alert.alert('Error', 'Please enter both make and model');
                    return;
                }
            } else if (editField === 'production_year') {
                if (!formData.production_year.trim()) {
                    Alert.alert('Error', 'Please enter the production year');
                    return;
                }
                if (isNaN(Number(formData.production_year)) || Number(formData.production_year) < 1900 || Number(formData.production_year) > new Date().getFullYear() + 1) {
                    Alert.alert('Error', 'Please enter a valid production year');
                    return;
                }
            } else if (editField === 'tire_type') {
                if (!formData.tire_type.trim()) {
                    Alert.alert('Error', 'Please select a tire type');
                    return;
                }
            } else if (editField === 'last_service') {
                if (!formData.last_service.trim()) {
                    Alert.alert('Error', 'Please select a service date');
                    return;
                }
            }
        } else {
            if (!validateForm()) return;
        }

        setLoading(true);

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                Alert.alert('Error', 'You must be logged in to edit a vehicle');
                setLoading(false);
                return;
            }

            // Build update object - only include fields that are being edited or are required
            const updateData: any = {};
            
            if (editField) {
                // For focused edit, only update the specific field
                if (editField === 'makeModel') {
                    updateData.make = formData.make.trim();
                    updateData.model = formData.model.trim();
                } else if (editField === 'production_year') {
                    updateData.production_year = parseInt(formData.production_year);
                } else if (editField === 'tire_type') {
                    updateData.tire_type = formData.tire_type.trim();
                } else if (editField === 'last_service') {
                    updateData.last_service = formData.last_service;
                }
            } else {
                // For full edit, update all fields
                updateData.garage_id = formData.garage_id;
                updateData.make = formData.make.trim();
                updateData.model = formData.model.trim();
                updateData.production_year = parseInt(formData.production_year);
                updateData.tire_type = formData.tire_type.trim();
                updateData.last_service = formData.last_service;
                updateData.availability = formData.availability;
            }

            // Update the main car record
            const { error: carError } = await supabase
                .from('cars')
                .update(updateData)
                .eq('id', carId);

            if (carError) {
                console.error('Car update error:', carError);
                Alert.alert('Database Error', `Failed to update vehicle: ${carError.message}`);
                setLoading(false);
                return;
            }

            Alert.alert('Success', 'Vehicle updated successfully!', [
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

    // If editField is specified, show a focused edit view
    if (editField) {
        return (
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        Edit {editField === 'makeModel' ? 'Make & Model' : 
                              editField === 'production_year' ? 'Year' :
                              editField === 'tire_type' ? 'Tire Type' :
                              editField === 'last_service' ? 'Last Service' : 'Field'}
                    </Text>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        {editField === 'makeModel' && (
                            <>
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
                            </>
                        )}

                        {editField === 'production_year' && (
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
                        )}

                        {editField === 'tire_type' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tire Type</Text>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowTireModal(true)}
                                >
                                    <Text style={[
                                        styles.dropdownButtonText,
                                        !formData.tire_type && styles.dropdownButtonTextPlaceholder
                                    ]}>
                                        {formData.tire_type || 'Select tire type'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {editField === 'last_service' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Last Service Date</Text>
                                {Platform.OS === 'web' ? (
                                    <input
                                        type="date"
                                        value={formData.last_service}
                                        onChange={(e) => handleInputChange('last_service', e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%',
                                            height: 52,
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 12,
                                            padding: '0 16px',
                                            fontSize: 16,
                                            color: '#0f1724',
                                            fontFamily: 'inherit',
                                        }}
                                    />
                                ) : (
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={[
                                            styles.dropdownButtonText,
                                            !formData.last_service && styles.dropdownButtonTextPlaceholder
                                        ]}>
                                            {formatDate(formData.last_service)}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={loading}
                                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Tire Type Modal */}
                <Modal
                    visible={showTireModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => {
                        setShowTireModal(false);
                        setShowCustomInput(false);
                        setCustomTireType('');
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Tire Type</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowTireModal(false);
                                        setShowCustomInput(false);
                                        setCustomTireType('');
                                    }}
                                    style={styles.modalCloseButton}
                                >
                                    <Ionicons name="close" size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {!showCustomInput ? (
                                <ScrollView style={styles.modalList}>
                                    {tireOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            onPress={() => handleTireTypeSelect(option)}
                                            style={styles.modalOption}
                                        >
                                            <Text style={styles.modalOptionText}>{option}</Text>
                                            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        onPress={() => setShowCustomInput(true)}
                                        style={styles.modalOption}
                                    >
                                        <Text style={styles.modalOptionText}>Custom</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                                    </TouchableOpacity>
                                </ScrollView>
                            ) : (
                                <View style={styles.modalCustomInput}>
                                    <Text style={styles.modalSubtitle}>Enter custom tire type</Text>
                                    <TextInput
                                        style={styles.modalTextInput}
                                        value={customTireType}
                                        onChangeText={setCustomTireType}
                                        placeholder="e.g., All-Season, Performance"
                                        placeholderTextColor="#9ca3af"
                                        autoFocus
                                    />
                                    <View style={styles.modalButtonContainer}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setShowCustomInput(false);
                                                setCustomTireType('');
                                            }}
                                            style={styles.modalCancelButton}
                                        >
                                            <Text style={styles.modalCancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleCustomTireSubmit}
                                            style={[
                                                styles.modalSubmitButton,
                                                !customTireType.trim() && styles.modalSubmitButtonDisabled
                                            ]}
                                            disabled={!customTireType.trim()}
                                        >
                                            <Text style={styles.modalSubmitButtonText}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>

                {/* Date Picker - Only for native platforms */}
                {Platform.OS !== 'web' && showDatePicker && (
                    <DateTimePicker
                        value={formData.last_service ? new Date(formData.last_service) : selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                    />
                )}
                {Platform.OS === 'ios' && showDatePicker && (
                    <View style={styles.iosDatePickerContainer}>
                        <View style={styles.iosDatePickerButtons}>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(false)}
                                style={styles.iosDatePickerButton}
                            >
                                <Text style={styles.iosDatePickerButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    const formattedDate = selectedDate.toISOString().split('T')[0];
                                    handleInputChange('last_service', formattedDate);
                                    setShowDatePicker(false);
                                }}
                                style={[styles.iosDatePickerButton, styles.iosDatePickerButtonPrimary]}
                            >
                                <Text style={styles.iosDatePickerButtonTextPrimary}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        );
    }

    if (loadingGarages) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0b6b8a" />
                <Text style={styles.loadingText}>Loading...</Text>
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
                            <Ionicons name="arrow-back" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerTitle}>Edit Vehicle</Text>
                    <Text style={styles.headerSubtitle}>Update vehicle information</Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    {garages.length > 0 && (
                        <View style={styles.card}>
                            <View style={styles.cardSectionHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: '#eef9ff' }]}>
                                    <Ionicons name="home" size={20} color="#0b6b8a" />
                                </View>
                                <Text style={styles.cardTitle}>Select Garage</Text>
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

                    {/* Vehicle Information */}
                    <View style={styles.card}>
                        <View style={styles.cardSectionHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: '#eef9ff' }]}>
                                <Ionicons name="car" size={20} color="#0b6b8a" />
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
                                <Ionicons name="build" size={20} color="#f59e0b" />
                            </View>
                            <Text style={styles.cardTitle}>Service Details</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tire Type</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setShowTireModal(true)}
                            >
                                <Text style={[
                                    styles.dropdownButtonText,
                                    !formData.tire_type && styles.dropdownButtonTextPlaceholder
                                ]}>
                                    {formData.tire_type || 'Select tire type'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Last Service Date</Text>
                            {Platform.OS === 'web' ? (
                                <input
                                    type="date"
                                    value={formData.last_service}
                                    onChange={(e) => handleInputChange('last_service', e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    style={{
                                        width: '100%',
                                        height: 52,
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 12,
                                        padding: '0 16px',
                                        fontSize: 16,
                                        color: '#0f1724',
                                        fontFamily: 'inherit',
                                    }}
                                />
                            ) : (
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={[
                                        styles.dropdownButtonText,
                                        !formData.last_service && styles.dropdownButtonTextPlaceholder
                                    ]}>
                                        {formatDate(formData.last_service)}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Availability Status */}
                    <View style={styles.card}>
                        <View style={styles.cardSectionHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: '#ecfdf5' }]}>
                                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
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
                                        <Ionicons name="checkmark" size={16} color="#fff" />
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
                                        <Ionicons name="close" size={16} color="#fff" />
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
                                <Text style={styles.submitButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Tire Type Modal */}
            <Modal
                visible={showTireModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    setShowTireModal(false);
                    setShowCustomInput(false);
                    setCustomTireType('');
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Tire Type</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowTireModal(false);
                                    setShowCustomInput(false);
                                    setCustomTireType('');
                                }}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {!showCustomInput ? (
                            <ScrollView style={styles.modalList}>
                                {tireOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        onPress={() => handleTireTypeSelect(option)}
                                        style={styles.modalOption}
                                    >
                                        <Text style={styles.modalOptionText}>{option}</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    onPress={() => setShowCustomInput(true)}
                                    style={styles.modalOption}
                                >
                                    <Text style={styles.modalOptionText}>Custom</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                                </TouchableOpacity>
                            </ScrollView>
                        ) : (
                            <View style={styles.modalCustomInput}>
                                <Text style={styles.modalSubtitle}>Enter custom tire type</Text>
                                <TextInput
                                    style={styles.modalTextInput}
                                    value={customTireType}
                                    onChangeText={setCustomTireType}
                                    placeholder="e.g., All-Season, Performance"
                                    placeholderTextColor="#9ca3af"
                                    autoFocus
                                />
                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowCustomInput(false);
                                            setCustomTireType('');
                                        }}
                                        style={styles.modalCancelButton}
                                    >
                                        <Text style={styles.modalCancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleCustomTireSubmit}
                                        style={[
                                            styles.modalSubmitButton,
                                            !customTireType.trim() && styles.modalSubmitButtonDisabled
                                        ]}
                                        disabled={!customTireType.trim()}
                                    >
                                        <Text style={styles.modalSubmitButtonText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Date Picker - Only for native platforms */}
            {Platform.OS !== 'web' && showDatePicker && (
                <DateTimePicker
                    value={formData.last_service ? new Date(formData.last_service) : selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
                <View style={styles.iosDatePickerContainer}>
                    <View style={styles.iosDatePickerButtons}>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            style={styles.iosDatePickerButton}
                        >
                            <Text style={styles.iosDatePickerButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                const formattedDate = selectedDate.toISOString().split('T')[0];
                                handleInputChange('last_service', formattedDate);
                                setShowDatePicker(false);
                            }}
                            style={[styles.iosDatePickerButton, styles.iosDatePickerButtonPrimary]}
                        >
                            <Text style={styles.iosDatePickerButtonTextPrimary}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
    loadingText: {
        marginTop: 16,
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
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f1724',
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
    dropdownButton: {
        width: '100%',
        height: 52,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#0f1724',
    },
    dropdownButtonTextPlaceholder: {
        color: '#9ca3af',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0f1724',
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalList: {
        maxHeight: 400,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#0f1724',
    },
    modalCustomInput: {
        padding: 20,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    modalTextInput: {
        width: '100%',
        height: 52,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#0f1724',
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 24,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    modalCancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '500',
    },
    modalSubmitButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 24,
        backgroundColor: '#0b6b8a',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSubmitButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    modalSubmitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    iosDatePickerContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    iosDatePickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
    },
    iosDatePickerButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    iosDatePickerButtonPrimary: {
        backgroundColor: '#0b6b8a',
        borderRadius: 8,
    },
    iosDatePickerButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '500',
    },
    iosDatePickerButtonTextPrimary: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

