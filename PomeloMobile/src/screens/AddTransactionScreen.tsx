import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useMutation, gql} from '@apollo/client';
import {useUser} from '../context/UserContext';

const ADD_TRANSACTION = gql`
  mutation AddTransaction($input: AddTransactionInput!) {
    addTransaction(input: $input) {
      id
      amount
      description
      date
      creditCard {
        id
        name
        balance
      }
    }
  }
`;

export const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const {user} = useUser();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');

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
    if (!amount || !description || !selectedCardId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    addTransaction({
      variables: {
        input: {
          amount: parseFloat(amount),
          description,
          creditCardId: selectedCardId,
          userId: user?.id,
        },
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
        />

        <Text style={styles.label}>Select Credit Card</Text>
        <TextInput
          style={styles.input}
          value={selectedCardId}
          onChangeText={setSelectedCardId}
          placeholder="Enter credit card ID"
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
});
