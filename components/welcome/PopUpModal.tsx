import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

interface PopUpModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
}

const PopUpModal = ({ visible, onClose, message }: PopUpModalProps) => (
  <Modal visible={visible} transparent={true} animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default PopUpModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f1724',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 26,
  },
  button: {
    backgroundColor: '#0b6b8a',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
