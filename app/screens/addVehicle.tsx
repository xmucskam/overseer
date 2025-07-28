import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';

export default function AddVehicle() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        make: '',
        model: '',
        production_year: '',
        tire_type: '',
        last_service: '',
        availability: true
    });

    const [loading, setLoading] = useState(false);

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
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) {
                Alert.alert('Error', 'You must be logged in to add a vehicle');
                setLoading(false);
                return;
            }

            // Generate a unique CUID for linking the tables
            const cuid = crypto.randomUUID();

            // Insert into records table
            const { data: recordData, error: recordError } = await supabase
                .from('records')
                .insert([{
                    make: formData.make.trim(),
                    model: formData.model.trim(),
                    production_year: parseInt(formData.production_year),
                    user_id: user.id,
                    cuid: cuid
                }])
                .select()
                .single();

            if (recordError) {
                console.error('Record insert error:', recordError);
                Alert.alert('Error', 'Failed to add vehicle record');
                setLoading(false);
                return;
            }

            // Insert into car_details table
            const { error: detailsError } = await supabase
                .from('car_details')
                .insert([{
                    cuid: cuid,
                    tire_type: formData.tire_type.trim(),
                    last_service: formData.last_service,
                    availability: formData.availability
                }]);

            if (detailsError) {
                console.error('Car details insert error:', detailsError);
                Alert.alert('Error', 'Failed to add vehicle details');
                setLoading(false);
                return;
            }

            Alert.alert('Success', 'Vehicle added successfully!', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]);

        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView className="flex-1 bg-gray-50">
                {/* Header */}
                <View className="bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-500 pt-12 pb-8 px-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity onPress={() => router.back()}>
                            <View className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <Text className="text-white text-lg">←</Text>
                            </View>
                        </TouchableOpacity>
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                                <Text className="text-white text-lg">🚗</Text>
                            </View>
                        </View>
                    </View>
                    <Text className="text-white text-2xl font-bold">Add Vehicle</Text>
                    <Text className="text-blue-100 text-sm mt-1">Register a new vehicle to your garage</Text>
                </View>

                {/* Form */}
                <View className="p-4 -mt-4">
                    {/* Vehicle Information Card */}
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

                            {/* Model */}
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

                            {/* Production Year */}
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

                    {/* Service Details Card */}
                    <View className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            <View className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                                <Text className="text-white text-sm">🔧</Text>
                            </View>
                            <Text className="text-lg font-bold text-gray-900">Service Details</Text>
                        </View>

                        <View className="space-y-4">
                            {/* Tire Type */}
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

                            {/* Last Service Date */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">Last Service Date</Text>
                                <TextInput
                                    value={formData.last_service}
                                    onChangeText={(text) => handleInputChange('last_service', text)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                                    placeholder="2025-01-15"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Availability Card */}
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

                    {/* Info Card */}
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

                    {/* Action Buttons */}
                    <View className="flex-row gap-3 mb-4">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="flex-1 py-4 px-6 bg-gray-100 rounded-lg border border-gray-200"
                        >
                            <Text className="text-gray-700 text-center font-medium">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className={`flex-1 py-4 px-6 rounded-lg ${
                                loading
                                    ? 'bg-gray-400'
                                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
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