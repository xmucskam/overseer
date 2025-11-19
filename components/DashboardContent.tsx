import React, { useRef, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

    // Simplified metrics - only show essential information
    const essentialMetrics = [
        { id: 'total', title: 'Total Vehicles', value: totalPosts, icon: '🚗', color: '#0b6b8a' },
        { id: 'available', title: 'Available', value: availableVehicles, icon: '✓', color: '#10b981' },
        { id: 'garages', title: 'Garages', value: garages.length, icon: '🏠', color: '#6366f1' },
    ];

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
                    marginHorizontal: 8,
                }}
            >
                <View style={{
                    backgroundColor: isActive ? '#f3fbff' : '#ffffff',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isActive ? 0.08 : 0.04,
                    shadowRadius: isActive ? 8 : 4,
                    elevation: isActive ? 3 : 1,
                    borderWidth: 1,
                    borderColor: isActive ? '#e6f7ff' : '#f1f5f9',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                backgroundColor: isActive ? '#eef9ff' : '#f6fbff',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12
                            }}>
                                <Text style={{ color: '#2b2b2b', fontSize: 20 }}>🏠</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: '#0f1724', fontSize: 18, fontWeight: '600', marginBottom: 4 }}>{garage.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ 
                                            width: 6, 
                                            height: 6, 
                                            borderRadius: 3, 
                                            backgroundColor: garageAvailable > 0 ? '#10b981' : '#6b7280',
                                            marginRight: 6 
                                        }} />
                                        <Text style={{ color: '#6b7280', fontSize: 13 }}>
                                            {garageAvailable} of {garageCars.length} available
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={{
                            backgroundColor: '#0b6b8a',
                            paddingVertical: 12,
                            borderRadius: 10,
                            alignItems: 'center',
                        }}
                        onPress={() => onAddVehiclePress(garage.id)}
                    >
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Add Vehicle</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderVehicleCard = (item: Post) => {
        const carDetail = item.cars;
        const available = !!carDetail?.availability;

        return (
            <Pressable
                key={item.id}
                onPress={() => onCarPress(item.id, item)}
                style={({ pressed }) => [
                    {
                        opacity: pressed ? 0.95 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                        marginBottom: 12,
                        borderRadius: 16,
                        backgroundColor: '#fff',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 2,
                        borderWidth: 1,
                        borderColor: '#f1f5f9',
                    },
                ]}
            >
                <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center' }}>
                    <View style={{ 
                        width: 70, 
                        height: 70, 
                        backgroundColor: '#f8fafc', 
                        borderRadius: 12, 
                        overflow: 'hidden', 
                        marginRight: 14, 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <Image
                            style={{ width: '100%', height: '100%' }}
                            source={StaticCarImage}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={{ fontSize: 17, fontWeight: '600', color: '#0f1724' }}>
                                {item.make} {item.model}
                            </Text>
                            <View style={{
                                backgroundColor: available ? '#ecfdf5' : '#fef2f2',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 8,
                            }}>
                                <Text style={{ 
                                    fontSize: 11, 
                                    fontWeight: '600', 
                                    color: available ? '#10b981' : '#ef4444',
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                }}>
                                    {available ? 'Available' : 'Unavailable'}
                                </Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                            {item.production_year}
                        </Text>
                        {carDetail?.last_service && (
                            <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                                Last service: {new Date(carDetail.last_service).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                        )}
                    </View>

                    <View style={{ justifyContent: 'center', marginLeft: 8 }}>
                        <Text style={{ color: '#d1d5db', fontSize: 24 }}>›</Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    if (garages.length === 0) {
        return (
            <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#f8fafc' }}>
                <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 }}>
                    <Text style={{ color: '#374151', fontSize: 16, marginBottom: 10 }}>No garages found</Text>
                    <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 14 }}>
                        Create your first garage to start managing your vehicle fleet
                    </Text>
                    <TouchableOpacity
                        style={{ backgroundColor: '#0b6b8a', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 }}
                        onPress={() => onAddVehiclePress()}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Create Garage</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    const currentGarage = garages[currentGarageIndex];

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <View style={{ padding: 16 }}>
                {/* Simplified Header */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: '#0f1724', fontSize: 24, fontWeight: '700', marginBottom: 4 }}>Dashboard</Text>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>Manage your vehicle fleet</Text>
                </View>

                {/* Essential Metrics - Clean 3-card layout */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
                    {essentialMetrics.map((metric) => (
                        <View
                            key={metric.id}
                            style={{
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
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ fontSize: 20, marginRight: 6 }}>{metric.icon}</Text>
                                <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    {metric.title}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 28, color: metric.color, fontWeight: '700' }}>{metric.value}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={{ marginBottom: 12 }}>
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

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                    {garages.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => scrollToGarage(index)}
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 8,
                                marginHorizontal: 6,
                                backgroundColor: index === currentGarageIndex ? '#0b6b8a' : '#d1d5db',
                            }}
                        />
                    ))}
                </View>

                <View style={{ alignItems: 'center', marginTop: 8 }}>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        {currentGarageIndex + 1} of {garages.length}
                    </Text>
                </View>
            </View>

            <View style={{ paddingHorizontal: 16, paddingBottom: 28 }}>
                {currentGarage?.cars.length > 0 ? (
                    <>
                        <Text style={{ 
                            color: '#0f1724', 
                            fontSize: 18, 
                            fontWeight: '600', 
                            marginBottom: 16,
                            marginTop: 8 
                        }}>
                            Vehicles
                        </Text>
                        {currentGarage.cars.map(vehicle => renderVehicleCard(vehicle))}
                    </>
                ) : (
                    <View style={{ 
                        backgroundColor: '#fff', 
                        borderWidth: 1, 
                        borderColor: '#f1f5f9', 
                        borderRadius: 16, 
                        padding: 32, 
                        alignItems: 'center',
                        shadowColor: '#000', 
                        shadowOffset: { width: 0, height: 1 }, 
                        shadowOpacity: 0.04, 
                        shadowRadius: 6 
                    }}>
                        <Text style={{ fontSize: 48, marginBottom: 16 }}>🚗</Text>
                        <Text style={{ color: '#374151', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>No vehicles yet</Text>
                        <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 20, fontSize: 14 }}>
                            Add your first vehicle to get started
                        </Text>
                        <TouchableOpacity
                            style={{ backgroundColor: '#0b6b8a', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }}
                            onPress={() => onAddVehiclePress(currentGarage?.id)}
                        >
                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Add First Vehicle</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default DashboardContent;