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
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setPosts(data);
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
