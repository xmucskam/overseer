import React from 'react';
import { View, Text, Modal, Button } from 'react-native';

const PopUpModal = ({ visible, onClose, message }: any) => (
    <Modal visible={visible} transparent={true} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View
                style={{
                    backgroundColor: 'white',
                    paddingVertical: 24,
                    paddingHorizontal: 20,
                    borderRadius: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 8,
                    width: '45%',
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: '400',
                        marginBottom: 16,
                        textAlign: 'center',
                        color: '#333',
                    }}
                >
                    {message}
                </Text>

                <Button title="Log In" onPress={onClose} color="#EF4444" />
            </View>
        </View>
    </Modal>
);

export default PopUpModal;
