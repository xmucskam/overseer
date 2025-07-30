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
    Dimensions,
} from 'react-native';
import {useLocalSearchParams, router, useRouter} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';

// @ts-ignore
import StaticCarImage from '@/assets/images/carTypes/removebg/sedan.png';

const { width } = Dimensions.get('window');

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
        console.log('delete', carId);
        if (!car) return;

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

            console.log('Success', 'Vehicle deleted successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
            router.replace('/dashboard');

        } catch (error) {
            console.error('Error deleting car:', error);
            Alert.alert('Error', 'Failed to delete vehicle');
        }
    };

    const confirmDelete = async () => {
        // if (!car) return;
        //
        // try {
        //     const { error } = await supabase
        //         .from('cars')
        //         .delete()
        //         .eq('id', car.id);
        //
        //     if (error) {
        //         console.error('Error deleting car:', error);
        //         Alert.alert('Error', 'Failed to delete vehicle');
        //         return;
        //     }
        //
        //     Alert.alert('Success', 'Vehicle deleted successfully', [
        //         {
        //             text: 'OK',
        //             onPress: () => router.back(),
        //         },
        //     ]);
        // } catch (error) {
        //     console.error('Error deleting car:', error);
        //     Alert.alert('Error', 'Failed to delete vehicle');
        // }
        //fiiiiiix
    };

    if (loading || !car) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="mt-4 text-gray-600">Loading vehicle details...</Text>
            </View>
        );
    }

    const carDetail = car.cars;
    const isAvailable = carDetail?.availability;
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - parseInt(car.production_year);
    const isModern = carAge <= 10;

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* Header */}
            <View className="bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50 pt-10 pb-4 px-6">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-9 h-9 bg-white/80 backdrop-blur rounded-xl items-center justify-center shadow shadow-black/10"
                    >
                        <Ionicons name="arrow-back" size={18} color="#475569" />
                    </TouchableOpacity>
                    <View className="flex-row space-x-2">
                        <TouchableOpacity
                            onPress={handleEdit}
                            className="w-9 h-9 bg-white/80 backdrop-blur rounded-xl items-center justify-center shadow shadow-black/10"
                        >
                            <Ionicons name="pencil" size={16} color="#475569" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="w-9 h-9 bg-rose-100/80 backdrop-blur rounded-xl items-center justify-center shadow shadow-black/10"
                        >
                            <Ionicons name="trash-outline" size={16} color="#e11d48" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Compact Profile Section */}
                <View className="flex-row items-center">
                    <View className="w-16 h-16 rounded-2xl bg-white/90 items-center justify-center mr-4 shadow shadow-black/10 overflow-hidden">
                        <Image
                            source={StaticCarImage}
                            style={{ width: '75%', height: '75%' }}
                            resizeMode="contain"
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-slate-900 text-base font-semibold mb-1">
                            {car.make} {car.model}
                        </Text>
                        <Text className="text-slate-600 text-sm mb-2">
                            {car.production_year} • {garage?.name || 'Garage'}
                        </Text>

                        {/* Inline Status Badge */}
                        <TouchableOpacity
                            onPress={toggleAvailability}
                            disabled={updatingAvailability}
                            className={`self-start px-3 py-1 rounded-lg ${
                                isAvailable
                                    ? 'bg-emerald-100 border border-emerald-200'
                                    : 'bg-rose-100 border border-rose-200'
                            }`}
                        >
                            {updatingAvailability ? (
                                <ActivityIndicator size="small" color={isAvailable ? '#059669' : '#e11d48'} />
                            ) : (
                                <Text className={`font-medium text-xs ${
                                    isAvailable ? 'text-emerald-700' : 'text-rose-700'
                                }`}>
                                    {isAvailable ? 'Available' : 'Unavailable'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Vehicle Details */}
                <View className="bg-gradient-to-br from-violet-50/50 to-indigo-50/50 mx-6 mt-5 rounded-2xl shadow shadow-black/10 border border-violet-100/50">
                    <View className="p-5 border-b border-violet-100/50">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-violet-100 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="car-sport" size={18} color="#7c3aed" />
                            </View>
                            <Text className="text-slate-900 font-bold text-lg">Vehicle Details</Text>
                        </View>
                    </View>

                    <View className="p-5 space-y-5">
                        <View className="bg-white/60 rounded-xl p-4">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-slate-600 font-medium text-sm">Make & Model</Text>
                                <TouchableOpacity onPress={() => handleEditField('makeModel')} className="p-1">
                                    <Ionicons name="pencil" size={14} color="#8b5cf6" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-slate-900 font-bold text-lg">
                                {car.make} {car.model}
                            </Text>
                        </View>

                        <View className="flex-row space-x-3">
                            <View className="flex-1 bg-white/60 rounded-xl p-4">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-slate-600 font-medium text-sm">Year</Text>
                                    <TouchableOpacity onPress={() => handleEditField('production_year')} className="p-1">
                                        <Ionicons name="pencil" size={14} color="#8b5cf6" />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-slate-900 font-bold text-lg">{car.production_year}</Text>
                                <Text className={`text-xs mt-1 ${isModern ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {`${carAge} yrs${isModern ? ' • Modern' : ''}`}
                                </Text>
                            </View>

                            <View className="flex-1 bg-white/60 rounded-xl p-4">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-slate-600 font-medium text-sm">Tire Type</Text>
                                    <TouchableOpacity onPress={() => handleEditField('tire_type')} className="p-1">
                                        <Ionicons name="pencil" size={14} color="#8b5cf6" />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-slate-900 font-bold text-base">
                                    {carDetail?.tire_type || 'Not set'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Service Information */}
                <View className="bg-gradient-to-br from-violet-50/50 to-indigo-50/50 mx-6 mt-4 rounded-2xl shadow shadow-black/10 border border-emerald-100/50">
                    <View className="p-5 border-b border-emerald-100/50">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-emerald-100 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="build" size={18} color="#059669" />
                            </View>
                            <Text className="text-slate-900 font-bold text-lg">Service History</Text>
                        </View>
                    </View>

                    <View className="p-5 space-y-4">
                        <View className="bg-white/60 rounded-xl p-4">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-slate-600 font-medium text-sm">Last Service Date</Text>
                                <TouchableOpacity onPress={() => handleEditField('last_service')} className="p-1">
                                    <Ionicons name="pencil" size={14} color="#059669" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-slate-900 font-bold text-base">
                                {carDetail?.last_service
                                    ? new Date(carDetail.last_service).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })
                                    : 'No service record'}
                            </Text>
                        </View>

                        <View className="bg-white/60 rounded-xl p-4">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-slate-600 font-medium text-sm">Added to Fleet</Text>
                                <TouchableOpacity onPress={() => handleEditField('created_at')} className="p-1">
                                    <Ionicons name="pencil" size={14} color="#059669" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-slate-900 font-bold text-base">
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
                <View className="mx-6 mt-4 mb-4">
                    <View className="flex-row items-center mb-3">
                        <View className="w-7 h-7 bg-sky-100 rounded-lg items-center justify-center mr-3">
                            <Ionicons name="analytics" size={16} color="#0ea5e9" />
                        </View>
                        <Text className="text-slate-900 font-semibold text-base">Quick Stats</Text>
                    </View>

                    <View className="flex-row space-x-3">
                        <View className="flex-1 bg-gradient-to-br from-violet-50/50 to-indigo-50/50 rounded-2xl p-4 border border-sky-100/50 items-center shadow shadow-black/10"> {/*style={{shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2}}*/}
                            <View className="w-10 h-10 bg-sky-100 rounded-xl items-center justify-center mb-2">
                                <Ionicons name="calendar-outline" size={20} color="#0ea5e9" />
                            </View>
                            <Text className="text-xl font-bold text-slate-900 mb-1">{carAge}</Text>
                            <Text className="text-slate-600 text-xs font-medium text-center">Years Old</Text>
                        </View>

                        <View className={`flex-1 rounded-2xl p-4 items-center shadow shadow-black/10 ${
                            isAvailable
                                ? 'bg-gradient-to-br from-emerald-50/80 to-green-50/80 border border-emerald-100/50'
                                : 'bg-gradient-to-br from-rose-50/80 to-red-50/80 border border-rose-100/50 shadow shadow-black/10'
                        }`}>
                            <View className={`w-10 h-10 rounded-xl items-center justify-center mb-2 ${
                                isAvailable ? 'bg-emerald-100' : 'bg-rose-100'
                            }`}>
                                <Ionicons
                                    name={isAvailable ? "checkmark-circle" : "close-circle"}
                                    size={20}
                                    color={isAvailable ? "#059669" : "#e11d48"}
                                />
                            </View>
                            <Text className={`text-xl font-bold mb-1 ${
                                isAvailable ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                                {isAvailable ? 'Yes' : 'No'}
                            </Text>
                            <Text className="text-slate-600 text-xs font-medium text-center">Available</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="mx-6 mb-8">
                    <Text className="text-gray-900 font-semibold text-lg mb-4">Quick Actions</Text>
                    <View className="space-y-3">
                        <TouchableOpacity
                            onPress={handleEdit}
                            className="bg-white rounded-2xl p-4 shadow shadow-black/10 border border-gray-100 flex-row items-center"
                        >
                            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
                                <Ionicons name="pencil" size={20} color="#3B82F6" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-900 font-medium text-base">Edit Vehicle Details</Text>
                                <Text className="text-gray-500 text-sm">Update vehicle information</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => Alert.alert('Coming Soon', 'Service history feature will be available soon')}
                            className="bg-white rounded-2xl p-4 shadow shadow-black/10 border border-gray-100 flex-row items-center"
                        >
                            <View className="w-12 h-12 bg-orange-50 rounded-full items-center justify-center mr-4">
                                <Ionicons name="build" size={20} color="#F59E0B" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-900 font-medium text-base">Service History</Text>
                                <Text className="text-gray-500 text-sm">View maintenance records</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => Alert.alert('Coming Soon', 'Share feature will be available soon')}
                            className="bg-white rounded-2xl p-4 shadow shadow-black/10  border border-gray-100 flex-row items-center"
                        >
                            <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mr-4">
                                <Ionicons name="share-outline" size={20} color="#10B981" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-900 font-medium text-base">Share Vehicle</Text>
                                <Text className="text-gray-500 text-sm">Share vehicle details</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}