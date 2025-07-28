import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import DashboardContent from '../../components/DashboardContent';
import { router } from 'expo-router';

export default function Dashboard() {
    const [cars, setCars] = useState<any[]>([]);
    const [postText, setPostText] = useState('');

    useEffect(() => {
        fetchGarageCars();
    }, []);

    const fetchGarageCars = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: garages, error: garageError } = await supabase
            .from('garages')
            .select('id, name')
            .eq('user_id', user.id)
            .limit(1); //first for now

        if (garageError || !garages?.length) {
            console.error('Error fetching garage:', garageError);
            return;
        }

        const garageId = garages[0].id;

        const { data: cars, error: carError } = await supabase
            .from('cars')
            .select('*')
            .eq('garage_id', garageId)
            .order('created_at', { ascending: false });

        if (carError) {
            console.error('Error fetching cars:', carError);
        } else {
            setCars(cars || []);
        }
    };

    const handleAddPost = async () => {
        // later
    };

    const handleAddVehiclePress = () => {
        router.push('../screens/addVehicle');
    };

    return (
        <DashboardContent
            postText={postText}
            setPostText={setPostText}
            handleAddPost={handleAddPost}
            posts={cars}
            onAddVehiclePress={handleAddVehiclePress}
        />
    );
}