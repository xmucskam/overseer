import React from 'react';
import { Button, FlatList, Text, TextInput, View, Image, TouchableOpacity, Pressable, ScrollView } from 'react-native';

import StaticCarImage from '@/assets/images/carTypes/removebg/sedan.png';

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
    cars?: VehicleDetails | null;
}

interface DashboardContentProps {
    postText: string;
    setPostText: (text: string) => void;
    handleAddPost: () => void;
    posts: Post[];
    onAddVehiclePress: () => void;
}
const DashboardContent: React.FC<DashboardContentProps> = ({
                                                               postText,
                                                               setPostText,
                                                               handleAddPost,
                                                               posts,
                                                               onAddVehiclePress,
                                                           }) => {
    const totalPosts = posts.length;
    const availableVehicles = posts.filter(post =>
        post.car_details?.availability === true
    ).length;

    const recentPosts = posts.filter(post => {
        const postDate = new Date(post.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return postDate >= weekAgo;
    }).length;

    const currentYear = new Date().getFullYear();
    const modernVehicles = posts.filter(post =>
        parseInt(post.production_year) >= currentYear - 10
    ).length;

    return (
        <ScrollView className="flex-1 p-4">
            <View className="mb-6">
                <View className="bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-500 rounded-xl p-6 mb-4 shadow-xl">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                                <Text className="text-white text-xl">🏠</Text>
                            </View>
                            <View>
                                <Text className="text-white text-2xl font-bold">Downtown Garage</Text>
                                <Text className="text-blue-100 text-sm">Primary Location</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-white text-3xl font-bold">{totalPosts}</Text>
                            <Text className="text-blue-100 text-xs">vehicles</Text>
                        </View>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-green-400 rounded-full mr-2"></View>
                            <Text className="text-blue-100 text-sm">All systems operational</Text>
                        </View>
                        <Text className="text-blue-100 text-sm">Last updated: {new Date().toLocaleTimeString()}</Text>
                    </View>
                </View>

                {/* grid */}
                <View className="flex-row flex-wrap gap-3">
                    <View className="bg-green-50 border border-green-200 rounded-xl p-4 w-[48%] h-24">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-2xl font-bold text-green-600">{availableVehicles}</Text>
                            <View className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <Text className="text-white text-sm">✓</Text>
                            </View>
                        </View>
                        <Text className="text-sm font-medium text-green-800">Available</Text>
                        <Text className="text-xs text-green-600">ready to go</Text>
                    </View>

                    <View className="bg-orange-50 border border-orange-200 rounded-xl p-4 w-[48%] h-24">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-2xl font-bold text-orange-600">{recentPosts}</Text>
                            <View className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <Text className="text-white text-sm">📅</Text>
                            </View>
                        </View>
                        <Text className="text-sm font-medium text-orange-800">Recent</Text>
                        <Text className="text-xs text-orange-600">this week</Text>
                    </View>

                    <View className="bg-purple-50 border border-purple-200 rounded-xl p-4 w-[48%] h-24">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-2xl font-bold text-purple-600">{modernVehicles}</Text>
                            <View className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <Text className="text-white text-sm">✨</Text>
                            </View>
                        </View>
                        <Text className="text-sm font-medium text-purple-800">Modern</Text>
                        <Text className="text-xs text-purple-600">2014 or newer</Text>
                    </View>

                    <View className="bg-teal-50 border border-teal-200 rounded-xl p-4 w-[48%] h-24">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-2xl font-bold text-teal-600">✓</Text>
                            <View className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                                <Text className="text-white text-sm">🔧</Text>
                            </View>
                        </View>
                        <Text className="text-sm font-medium text-teal-800">Serviced</Text>
                        <Text className="text-xs text-teal-600">all up to date</Text>
                    </View>
                </View>

                {/* Dashboard info */}
                <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-3">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-gray-800">Garage Capacity</Text>
                            <View className="flex-row items-center mt-1">
                                <View className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                    <View
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${Math.min((totalPosts / 20) * 100, 100)}%` }}
                                    ></View>
                                </View>
                                <Text className="text-xs text-gray-600">{totalPosts}/20</Text>
                            </View>
                        </View>
                        <View className="flex-1 ml-4">
                            <Text className="text-sm font-medium text-gray-800">Monthly Activity</Text>
                            <View className="flex-row items-center mt-1">
                                <Text className="text-green-600 text-sm font-bold">+{recentPosts}</Text>
                                <Text className="text-xs text-gray-600 ml-1">this month</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* posts section */}
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-blue-300">Your Vehicles</Text>
                <TouchableOpacity
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                    onPress={onAddVehiclePress}
                >
                    <Text className="text-white text-sm font-medium">Add Vehicle</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const carDetail = item.cars;

                    return (
                        <Pressable className={`bg-gradient-to-tl ${carDetail?.availability ? 'from-success to-gray-50 border border-success' : 'from-gray-100 to-gray-50 border border-error'} rounded-lg mb-4 overflow-hidden p-4`}>
                            <View className="flex-row mb-3">
                                <View className="w-20 h-20 bg-white rounded-lg overflow-hidden mr-3">
                                    <Image
                                        style={{ width: '100%', height: '100%' }}
                                        source={StaticCarImage}
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* main title*/}
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

                            {/* info section */}
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
                }}
            />
        </ScrollView>
    );
};

export default DashboardContent;