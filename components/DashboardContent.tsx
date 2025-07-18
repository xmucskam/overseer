import React from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';

interface Post {
    id: string;
    make: string;
    model: string;
    production_year: string;
    created_at: string;
}

interface DashboardContentProps {
    postText: string;
    setPostText: (text: string) => void;
    handleAddPost: () => void;
    posts: Post[];
}

const DashboardContent: React.FC<DashboardContentProps> = ({
                                                               postText,
                                                               setPostText,
                                                               handleAddPost,
                                                               posts,
                                                           }) => {
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
                        <Text>{item.production_year}</Text>
                        <Text style={{ fontSize: 10, color: '#666' }}>{item.created_at}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default DashboardContent;
