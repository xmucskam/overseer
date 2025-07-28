import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import DashboardContent from '../../components/DashboardContent';
import { router } from 'expo-router';

interface Garage {
    id: string;
    name: string;
    cars: any[];
}

export default function Dashboard() {
    const [garages, setGarages] = useState<Garage[]>([]);
    const [postText, setPostText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGaragesWithCars();
    }, []);

    const fetchGaragesWithCars = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: garages, error: garageError } = await supabase
            .from('garages')
            .select('id, name')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (garageError) {
            console.error('Error fetching garages:', garageError);
            setLoading(false);
            return;
        }

        if (!garages?.length) {
            setGarages([]);
            setLoading(false);
            return;
        }

        const garagesWithCars = await Promise.all(
            garages.map(async (garage) => {
                const { data: cars, error: carError } = await supabase
                    .from('cars')
                    .select('*')
                    .eq('garage_id', garage.id)
                    .order('availability', { ascending: false });

                if (carError) {
                    console.error(`Error fetching cars for garage ${garage.id}:`, carError);
                    return { ...garage, cars: [] };
                }

                const formattedCars = (cars || []).map(car => ({
                    id: car.id,
                    make: car.make,
                    model: car.model,
                    production_year: String(car.production_year),
                    created_at: car.created_at,
                    garage_id: car.garage_id,
                    cars: {
                        availability: car.availability,
                        tire_type: car.tire_type,
                        last_service: car.last_service,
                    },
                }));

                return { ...garage, cars: formattedCars };
            })
        );

        setGarages(garagesWithCars);
        setLoading(false);
    };

    const handleAddPost = async () => {
        // later
    };

    const handleAddVehiclePress = (garageId?: string) => {
        if (garageId) {
            router.push(`../screens/addVehicle?garageId=${garageId}`);
        } else {
            router.push('../screens/addVehicle');
        }
    };

    if (loading) {
        return null;
    }

    return (
        <DashboardContent
            postText={postText}
            setPostText={setPostText}
            handleAddPost={handleAddPost}
            garages={garages}
            onAddVehiclePress={handleAddVehiclePress}
        />
    );
}