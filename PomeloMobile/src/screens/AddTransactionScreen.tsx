import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@apollo/client';
import {useUser} from '../context/UserContext';
import {ADD_TRANSACTION} from '../apollo/graphql';
import {EventType, eventTypeLabels} from '../models/transactionModel';

export const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const {user} = useUser();
  const [amount, setAmount] = useState('');
  const [eventType, setEventType] = useState<EventType>(EventType.TXN_SETTLED);
  const [txnId, setTxnId] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const [addTransaction, {loading}] = useMutation(ADD_TRANSACTION, {
    onCompleted: () => {
      Alert.alert('Success', 'Transaction added successfully');
      navigation.goBack();
    },
    onError: error => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSubmit = () => {
    if (!amount || !eventType) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    addTransaction({
      variables: {
        userId: user?.id,
        eventType,
        txnId: txnId || `txn_${Date.now()}`,
        eventTime: Math.floor(Date.now() / 1000),
        amount: parseInt(amount, 10),
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>
          Current User: {user?.id ? user.id : 'Not Set'}
        </Text>

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Transaction Type</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setModalVisible(true)}>
          <Text>{eventTypeLabels[eventType]}</Text>
        </TouchableOpacity>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Transaction Type</Text>
                  {Object.values(EventType).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={styles.modalItem}
                      onPress={() => {
                        setEventType(type);
                        setModalVisible(false);
                      }}>
                      <Text>{eventTypeLabels[type]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Text style={styles.label}>Transaction ID</Text>
        <TextInput
          style={styles.input}
          value={txnId}
          onChangeText={setTxnId}
          placeholder="Enter transaction ID (optional)"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Adding...' : 'Add Transaction'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionId: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  transactionAmount: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  transactionItem: {
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
