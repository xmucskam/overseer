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
        <View className="p-4">
            <TextInput
                placeholder="What's on your mind?"
                value={postText}
                onChangeText={setPostText}

                className="p-2 border-2 mb-1.5"
            />
            <Button title="Post" onPress={handleAddPost} />

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View >
                        <Text>{item.make} {item.model}</Text>
                        <Text>{item.production_year}</Text>
                        <Text>{item.created_at}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default DashboardContent;
