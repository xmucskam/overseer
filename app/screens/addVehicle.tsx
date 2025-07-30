import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/utils/supabase';

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
    }, []);

    const fetchGarages = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('User error:', userError);
                setLoadingGarages(false);
                return;
            }

            console.log('Fetching garages for user:', user.id);

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

            console.log('Garages fetched:', data);

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

            console.log('Creating default garage for user:', userId);

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
                console.log('Default garage created:', data);
                setGarages([data]);
                setFormData(prev => ({ ...prev, garage_id: data.id }));
            }
        } catch (error) {
            console.error('Error creating default garage:', error);
        }
    };

    const createNewGarage = async () => {
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

            console.log('Adding vehicle for user:', user.id);
            console.log('Form data:', formData);

            const carPayload = {
                garage_id: formData.garage_id,
                make: formData.make.trim(),
                model: formData.model.trim(),
                production_year: parseInt(formData.production_year), // int4 in your DB
                tire_type: formData.tire_type.trim(),
                last_service: formData.last_service, // date format
                availability: formData.availability, // bool
                created_at: new Date().toISOString()
            };

            console.log('Inserting car:', carPayload);

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

            console.log('Vehicle added successfully:', carData);

            Alert.alert('Success', 'Vehicle added successfully!', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]);

        } catch (error) {
            console.error('Submit error:', error);
            // Alert.alert('Error', `Something went wrong: ${error.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    if (loadingGarages) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Text className="text-white text-xl">🚗</Text>
                </View>
                <Text className="text-gray-500 text-lg">Loading garages...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView className="flex-1 bg-gray-50">
                <View className="bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-500 pt-12 pb-8 px-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity onPress={() => router.back()}>
                            <View className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <Text className="text-white text-lg">←</Text>
                            </View>
                        </TouchableOpacity>
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <Text className="text-white text-xl">🚗</Text>
                            </View>
                        </View>
                    </View>
                    <Text className="text-white text-2xl font-bold">Add Vehicle</Text>
                    <Text className="text-blue-100 text-sm mt-1">Register a new vehicle to your garage</Text>
                </View>

                {/* Form */}
                <View className="p-4 -mt-4">
                    {garages.length > 0 && (
                        <View className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-100">
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                                        <Text className="text-white text-sm">🏠</Text>
                                    </View>
                                    <Text className="text-lg font-bold text-gray-900">Select Garage</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={createNewGarage}
                                    className="bg-purple-100 px-3 py-1 rounded-lg"
                                >
                                    <Text className="text-purple-600 text-xs font-medium">+ New</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-3">
                                    {garages.map((garage) => (
                                        <TouchableOpacity
                                            key={garage.id}
                                            onPress={() => handleInputChange('garage_id', garage.id)}
                                            className={`px-4 py-3 rounded-lg border-2 min-w-[120px] ${
                                                formData.garage_id === garage.id
                                                    ? 'bg-purple-50 border-purple-200'
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <Text className={`text-center font-medium ${
                                                formData.garage_id === garage.id
                                                    ? 'text-purple-700'
                                                    : 'text-gray-600'
                                            }`}>
                                                {garage.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}

                    {garages.length === 0 && (
                        <View className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-100 items-center">
                            <View className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Text className="text-2xl">🏠</Text>
                            </View>
                            <Text className="text-lg font-bold text-gray-900 mb-2">No Garages Found</Text>
                            <Text className="text-gray-500 text-center mb-4">
                                You need to create a garage first before adding vehicles
                            </Text>
                            <TouchableOpacity
                                onPress={createNewGarage}
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 rounded-lg"
                            >
                                <Text className="text-white font-medium">Create First Garage</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            <View className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                <Text className="text-white text-sm">ℹ️</Text>
                            </View>
                            <Text className="text-lg font-bold text-gray-900">Vehicle Information</Text>
                        </View>

                        <View className="space-y-4">
                            {/* Make */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">Make</Text>
                                <TextInput
                                    value={formData.make}
                                    onChangeText={(text) => handleInputChange('make', text)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                                    placeholder="Toyota, BMW, Audi"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">Model</Text>
                                <TextInput
                                    value={formData.model}
                                    onChangeText={(text) => handleInputChange('model', text)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                                    placeholder="Camry, X5, A4"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">Production Year</Text>
                                <TextInput
                                    value={formData.production_year}
                                    onChangeText={(text) => handleInputChange('production_year', text)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                                    placeholder="2020"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    <View className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            <View className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                                <Text className="text-white text-sm">🔧</Text>
                            </View>
                            <Text className="text-lg font-bold text-gray-900">Service Details</Text>
                        </View>

                        <View className="space-y-4">
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">Tire Type</Text>
                                <TextInput
                                    value={formData.tire_type}
                                    onChangeText={(text) => handleInputChange('tire_type', text)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                                    placeholder="All-Season, Winter, Summer"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">Last Service Date</Text>
                                <TextInput
                                    value={formData.last_service}
                                    onChangeText={(text) => handleInputChange('last_service', text)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                                    placeholder="2025-01-15"
                                    placeholderTextColor="#9CA3AF"
                                />
                                <Text className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</Text>
                            </View>
                        </View>
                    </View>

                    <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            <View className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                <Text className="text-white text-sm">✓</Text>
                            </View>
                            <Text className="text-lg font-bold text-gray-900">Availability Status</Text>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => handleInputChange('availability', true)}
                                className={`flex-1 p-4 rounded-lg border-2 ${
                                    formData.availability
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <View className="flex-row items-center justify-center">
                                    <View className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                                        formData.availability ? 'bg-green-500' : 'bg-gray-300'
                                    }`}>
                                        <Text className="text-white text-xs">✓</Text>
                                    </View>
                                    <Text className={`font-medium ${
                                        formData.availability ? 'text-green-700' : 'text-gray-600'
                                    }`}>
                                        Available
                                    </Text>
                                </View>
                                <Text className={`text-xs text-center mt-1 ${
                                    formData.availability ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    Ready to use
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleInputChange('availability', false)}
                                className={`flex-1 p-4 rounded-lg border-2 ${
                                    !formData.availability
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <View className="flex-row items-center justify-center">
                                    <View className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                                        !formData.availability ? 'bg-red-500' : 'bg-gray-300'
                                    }`}>
                                        <Text className="text-white text-xs">✕</Text>
                                    </View>
                                    <Text className={`font-medium ${
                                        !formData.availability ? 'text-red-700' : 'text-gray-600'
                                    }`}>
                                        Not Available
                                    </Text>
                                </View>
                                <Text className={`text-xs text-center mt-1 ${
                                    !formData.availability ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                    Under maintenance
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="bg-blue-50 border border-blue-200 rounded-xl mb-4 p-4">
                        <View className="flex-row items-center mb-2">
                            <View className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                                <Text className="text-white text-xs">i</Text>
                            </View>
                            <Text className="text-sm font-medium text-blue-800">Important Information</Text>
                        </View>
                        <Text className="text-xs text-blue-600">
                            Make sure all vehicle information is accurate. This data will be used for maintenance tracking and availability management.
                        </Text>
                    </View>

                    <View className="flex-row gap-3 mb-4">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="flex-1 py-4 px-6 bg-gray-100 rounded-lg border border-gray-200"
                        >
                            <Text className="text-gray-700 text-center font-medium">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading || garages.length === 0}
                            className={`flex-1 py-4 px-6 rounded-lg ${
                                loading || garages.length === 0
                                    ? 'bg-gray-400'
                                    : 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500'
                            }`}
                        >
                            <Text className="text-white text-center font-bold">
                                {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}