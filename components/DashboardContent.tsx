import React, { useState, useRef } from 'react';
import { Button, FlatList, Text, TextInput, View, Image, TouchableOpacity, Pressable, ScrollView, Dimensions } from 'react-native';

// @ts-ignore
import StaticCarImage from '@/assets/images/carTypes/removebg/sedan.png';

const { width: screenWidth } = Dimensions.get('window');
const GARAGE_CARD_WIDTH = screenWidth - 32; // 16px margin on each side

interface VehicleDetails {
    tire_type: string;
    last_service: string;
    availability: boolean;
}

interface Post {
    id: string;
    make: string;
    model: string;
    production_year: string;
    created_at: string;
    garage_id: string;
    cars?: VehicleDetails | null;
}

interface Garage {
    id: string;
    name: string;
    cars: Post[];
}

interface DashboardContentProps {
    postText: string;
    setPostText: (text: string) => void;
    handleAddPost: () => void;
    garages: Garage[];
    onAddVehiclePress: (garageId?: string) => void;
    onCarPress: (carId: string, carData: Post) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
                                                               postText,
                                                               setPostText,
                                                               handleAddPost,
                                                               garages,
                                                               onAddVehiclePress,
                                                               onCarPress,
                                                           }) => {
    const [currentGarageIndex, setCurrentGarageIndex] = useState(0);
    const garageScrollRef = useRef<ScrollView>(null);

    const allCars = garages.flatMap(garage => garage.cars);
    const totalPosts = allCars.length;
    const availableVehicles = allCars.filter(post =>
        post.cars?.availability === true
    ).length;

    const recentPosts = allCars.filter(post => {
        const postDate = new Date(post.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return postDate >= weekAgo;
    }).length;

    const currentYear = new Date().getFullYear();
    const modernVehicles = allCars.filter(post =>
        parseInt(post.production_year) >= currentYear - 10
    ).length;

    const handleGarageScroll = (event: any) => {
        const scrollX = event.nativeEvent.contentOffset.x;
        const cardWidth = GARAGE_CARD_WIDTH + 16;
        const index = Math.round((scrollX + 8) / cardWidth);

        const clampedIndex = Math.max(0, Math.min(index, garages.length - 1));

        setCurrentGarageIndex(clampedIndex);
    };

    const scrollToGarage = (index: number) => {
        const cardWidth = GARAGE_CARD_WIDTH + 16;
        garageScrollRef.current?.scrollTo({
            x: index * cardWidth,
            animated: true,
        });
        setCurrentGarageIndex(index);
    };

    const renderGarageCard = (garage: Garage, index: number) => {
        const garageCars = garage.cars;
        const garageAvailable = garageCars.filter(car => car.cars?.availability === true).length;
        const isActive = index === currentGarageIndex;

        return (
            <View
                key={garage.id}
                style={{
                    width: GARAGE_CARD_WIDTH,
                    marginHorizontal: 8
                }}
            >
                <View className={`${isActive ? 'bg-gradient-to-tl from-sky-400 to-purple-400' : 'bg-gradient-to-tr from-gray-300 via-gray-300 to-gray-300'} rounded-xl p-6 mb-4 transition-all duration-300`}>
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                                <Text className="text-white text-xl">🏠</Text>
                            </View>
                            <View>
                                <Text className="text-white text-2xl font-bold">{garage.name}</Text>
                                <Text className="text-blue-100 text-sm">{garageCars.length} vehicles</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-white text-3xl font-bold">{garageAvailable}</Text>
                            <Text className="text-blue-100 text-xs">available</Text>
                        </View>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-green-400 rounded-full mr-2"></View>
                            <Text className="text-blue-100 text-sm">All systems operational</Text>
                        </View>
                        <TouchableOpacity
                            className="bg-white bg-opacity-20 px-3 py-1 rounded-lg"
                            onPress={() => onAddVehiclePress(garage.id)}
                        >
                            <Text className="text-white text-sm font-medium">Add Vehicle</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex-row justify-center gap-2 mb-4">
                    <View className="bg-green-50 border border-green-200 rounded-lg p-3 flex-1 max-w-[30%]">
                        <Text className="text-xl font-bold text-green-600">{garageAvailable}</Text>
                        <Text className="text-xs font-medium text-green-800">Available</Text>
                    </View>
                    <View className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex-1 max-w-[30%]">
                        <Text className="text-xl font-bold text-orange-600">{garageCars.length}</Text>
                        <Text className="text-xs font-medium text-orange-800">Total</Text>
                    </View>
                    <View className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex-1 max-w-[30%]">
                        <Text className="text-xl font-bold text-purple-600">
                            {garageCars.filter(car => parseInt(car.production_year) >= currentYear - 10).length}
                        </Text>
                        <Text className="text-xs font-medium text-purple-800">Modern</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderVehicleCard = (item: Post) => {
        const carDetail = item.cars;
        return (
            <Pressable
                key={item.id}
                className={`bg-gradient-to-tl ${carDetail?.availability ? 'from-success to-gray-50 border border-success' : 'from-gray-100 to-gray-50 border border-error'} rounded-lg mb-4 overflow-hidden p-4 active:opacity-70 active:scale-98`}
                onPress={() => onCarPress(item.id, item)}
                style={({ pressed }) => [
                    {
                        opacity: pressed ? 0.7 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                    }
                ]}
            >
                <View className="flex-row mb-3">
                    <View className="w-20 h-20 bg-white rounded-lg overflow-hidden mr-3">
                        <Image
                            style={{ width: '100%', height: '100%' }}
                            source={StaticCarImage}
                            resizeMode="contain"
                        />
                    </View>

                    <View className="flex-1 justify-center">
                        <Text className="text-lg font-bold text-gray-900 mb-1">
                            {item.make} {item.model}
                        </Text>
                        <Text className="text-sm text-gray-600 mb-1">
                            Year: {item.production_year}
                        </Text>
                        <Text className="text-xs text-blue-600 font-medium">
                            {carDetail?.availability ? 'Available Now' : 'Not Available'}
                        </Text>
                    </View>

                    <View className="justify-center">
                        <Text className="text-gray-400 text-xl">›</Text>
                    </View>
                </View>

                <View className="border-t border-gray-100 pt-3">
                    <View className="flex-row justify-between mb-2">
                        <View className="flex-row items-center">
                            <View className="w-3 h-3 bg-blue-500 rounded-full mr-2"></View>
                            <Text className="text-sm text-gray-600">Tire:</Text>
                        </View>
                        <Text className="text-sm font-medium text-gray-900">
                            {carDetail?.tire_type || 'Unknown'}
                        </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <View className="flex-row items-center">
                            <View className="w-3 h-3 bg-orange-500 rounded-full mr-2"></View>
                            <Text className="text-sm text-gray-600">Last Service:</Text>
                        </View>
                        <Text className="text-sm font-medium text-gray-900">
                            {carDetail?.last_service ? new Date(carDetail.last_service).toLocaleDateString() : 'N/A'}
                        </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <View className="flex-row items-center">
                            <View className="w-3 h-3 bg-green-500 rounded-full mr-2"></View>
                            <Text className="text-sm text-gray-600">Availability:</Text>
                        </View>
                        <Text className={`text-sm font-medium ${carDetail?.availability ? 'text-green-600' : 'text-red-600'}`}>
                            {carDetail?.availability ? 'Available' : 'Not Available'}
                        </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Text className="text-xs text-gray-400">
                                Posted: {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };

    if (garages.length === 0) {
        return (
            <ScrollView className="flex-1 p-4">
                <View className="bg-gray-50 border border-gray-200 rounded-xl p-8 items-center">
                    <Text className="text-gray-500 text-xl mb-4">No garages found</Text>
                    <Text className="text-gray-400 text-center mb-4">
                        Create your first garage to start managing your vehicle fleet
                    </Text>
                    <TouchableOpacity
                        className="bg-blue-500 px-6 py-3 rounded-lg"
                        onPress={() => onAddVehiclePress()}
                    >
                        <Text className="text-white font-medium">Create Garage</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    const currentGarage = garages[currentGarageIndex];

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="pb-2">
                <View className="bg-gradient-to-tr from-purple-400 to-red-400 rounded-b-xl p-8 mb-4 shadow-xl">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                                <Text className="text-white text-xl">📊</Text>
                            </View>
                            <View>
                                <Text className="text-white text-2xl font-bold">Overview (user)</Text>
                                <Text className="text-pink-100 text-sm">{garages.length} Garages Total</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-white text-3xl font-bold">{totalPosts}</Text>
                            <Text className="text-pink-100 text-xs">total vehicles</Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row flex-wrap justify-center gap-3 mb-4">
                    <View className="bg-green-50 border border-green-200 rounded-xl p-3 w-[42%] h-24">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-2xl font-bold text-green-600">{availableVehicles}</Text>
                            <View className="w-8 h-8 bg-green-300 rounded-full flex items-center justify-center">
                                <Text className="text-white text-sm">✓</Text>
                            </View>
                        </View>
                        <Text className="text-sm font-medium text-green-800">Available</Text>
                        <Text className="text-xs text-green-600">ready to go</Text>
                    </View>

                    <View className="bg-orange-50 border border-orange-200 rounded-xl p-3 w-[42%] h-24">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-2xl font-bold text-orange-600">{recentPosts}</Text>
                            <View className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                                <Text className="text-white text-sm">📅</Text>
                            </View>
                        </View>
                        <Text className="text-sm font-medium text-orange-800">Recent</Text>
                        <Text className="text-xs text-orange-600">this week</Text>
                    </View>

                    <View className="bg-purple-50 border border-purple-200 rounded-xl p-3 w-[42%] h-24">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-2xl font-bold text-purple-600">{modernVehicles}</Text>
                            <View className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                                <Text className="text-white text-sm">✨</Text>
                            </View>
                        </View>
                        <Text className="text-sm font-medium text-purple-800">Modern</Text>
                        <Text className="text-xs text-purple-600">2014 or newer</Text>
                    </View>

                    <View className="bg-blue-50 border border-blue-200 rounded-xl p-3 w-[42%] h-24">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-2xl font-bold text-blue-600">{garages.length}</Text>
                            <View className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                                <Text className="text-white text-sm">🏠</Text>
                            </View>
                        </View>
                        <Text className="text-sm font-medium text-blue-800">Garages</Text>
                        <Text className="text-xs text-blue-600">locations</Text>
                    </View>
                </View>
            </View>

            <View className="mb-4">
                <ScrollView
                    ref={garageScrollRef}
                    horizontal
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleGarageScroll}
                    onMomentumScrollEnd={handleGarageScroll}
                    scrollEventThrottle={16}
                    snapToInterval={GARAGE_CARD_WIDTH + 16}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    bounces={false}
                    contentContainerStyle={{
                        paddingHorizontal: 8,
                    }}
                >
                    {garages.map((garage, index) => renderGarageCard(garage, index))}
                </ScrollView>

                <View className="flex-row justify-center items-center">
                    {garages.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => scrollToGarage(index)}
                            className={`w-2 h-2 rounded-full mx-1 ${
                                index === currentGarageIndex ? 'bg-blue-400' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </View>

                <View className="items-center mt-2">
                    <Text className="text-sm text-gray-500">
                        {currentGarageIndex + 1} of {garages.length}
                    </Text>
                </View>
            </View>

            <View className="px-4 pb-4">
                {currentGarage?.cars.length > 0 ? (
                    currentGarage.cars.map(vehicle => renderVehicleCard(vehicle))
                ) : (
                    <View className="bg-white border border-gray-200 rounded-xl p-6 items-center">
                        <Text className="text-gray-500 text-lg mb-2">No vehicles in this garage</Text>
                        <Text className="text-gray-400 text-center mb-4">
                            Add your first vehicle to get started
                        </Text>
                        <TouchableOpacity
                            className="bg-blue-500 px-4 py-2 rounded-lg"
                            onPress={() => onAddVehiclePress(currentGarage?.id)}
                        >
                            <Text className="text-white text-sm font-medium">Add First Vehicle</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default DashboardContent;