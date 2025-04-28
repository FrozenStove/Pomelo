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
import {useMutation} from '@apollo/client';
import {useUser} from '../context/UserContext';
import {INITIALIZE_CREDIT_CARD} from '../apollo/graphql';

export const InitializeCreditCardScreen = () => {
  const navigation = useNavigation();
  const {setUser, refetchCreditSummary} = useUser();
  const [creditLimit, setCreditLimit] = useState('');
  const [newUserId, setNewUserId] = useState('');

  const [initializeCreditCard, {loading}] = useMutation(
    INITIALIZE_CREDIT_CARD,
    {
      onCompleted: () => {
        Alert.alert('Success', 'Credit card initialized successfully');
        navigation.goBack();
      },
      onError: error => {
        Alert.alert('Error', error.message);
      },
    },
  );

  const handleSubmit = async () => {
    if (!creditLimit || !newUserId) {
      Alert.alert('Error', 'Please enter both credit limit and user ID');
      return;
    }

    // Update the current user to the new user ID
    setUser({id: newUserId});

    await initializeCreditCard({
      variables: {
        userId: newUserId,
        creditLimit: parseInt(creditLimit, 10),
      },
    });
    await refetchCreditSummary();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>User ID</Text>
        <TextInput
          style={styles.input}
          value={newUserId}
          onChangeText={setNewUserId}
          placeholder="Enter user ID"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Credit Limit</Text>
        <TextInput
          style={styles.input}
          value={creditLimit}
          onChangeText={setCreditLimit}
          placeholder="Enter credit limit"
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Initializing...' : 'Initialize Credit Card'}
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
