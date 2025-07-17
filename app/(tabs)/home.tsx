import React, { useEffect, useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import { supabase } from '../../utils/supabase';

export default function Home() {
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
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="What's on your mind?"
        value={postText}
        onChangeText={setPostText}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />
      <Button title="Post" onPress={handleAddPost} />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 8, borderBottomWidth: 1 }}>
            <Text>{item.make} {item.model}</Text>
            <Text>{item.production_year} </Text>
            <Text style={{ fontSize: 10, color: '#666' }}>{item.created_at}</Text>
          </View>
        )}
      />
    </View>
  );
}
