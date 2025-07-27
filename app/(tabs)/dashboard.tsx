import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import DashboardContent from '../../components/DashboardContent';

export default function Dashboard() {
    const [postText, setPostText] = useState('');
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('records')
            .select(`
            *,
            car_details (
                tire_type,
                last_service,
                availability
            )
        `)
            .order('created_at', { ascending: false });

        console.log('Raw data from Supabase:', JSON.stringify(data, null, 2));

        if (error) {
            console.error('Supabase error:', error);
        } else {
            setPosts(data || []);
        }

        // works partially
        // const { data, error } = await supabase
        //     .from('records')
        //     .select(`
        //         *,
        //         car_details (
        //             tire_type,
        //             last_service,
        //             availability
        //         )
        //     `)
        //     .order('created_at', { ascending: false });
        //
        // console.log(data);
        // if (error) console.error(error);
        // else setPosts(data);

        // Check if CUIDs actually match between tables
        // const { data: recordCuids } = await supabase
        //     .from('records')
        //     .select('cuid')
        //     .limit(5);
        //
        // const { data: carDetailsCuids } = await supabase
        //     .from('car_details')
        //     .select('cuid')
        //     .limit(5);
        //
        // console.log('Record CUIDs:', recordCuids);
        // console.log('Car Details CUIDs:', carDetailsCuids);
    };

    const handleAddPost = async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return alert('Not logged in');

        const { error } = await supabase.from('posts').insert([
            {
                content: postText,
                user_id: user.id,
            },
        ]);

        if (error) console.error(error);
        else {
            setPostText('');
            fetchPosts();
        }
    };

    return (
        <DashboardContent
            postText={postText}
            setPostText={setPostText}
            handleAddPost={handleAddPost}
            posts={posts}
        />
    );
}
