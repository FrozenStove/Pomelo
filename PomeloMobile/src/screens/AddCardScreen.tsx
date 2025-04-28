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

const ADD_CARD = gql`
  mutation AddCard($input: AddCardInput!) {
    addCard(input: $input) {
      id
      name
      balance
      limit
    }
  }
`;

export const AddCardScreen = () => {
  const navigation = useNavigation();
  const {user} = useUser();
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');

  const [addCard, {loading}] = useMutation(ADD_CARD, {
    onCompleted: () => {
      Alert.alert('Success', 'Credit card added successfully');
      navigation.goBack();
    },
    onError: error => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSubmit = () => {
    if (!name || !limit) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    addCard({
      variables: {
        input: {
          name,
          limit: parseFloat(limit),
          userId: user?.id,
        },
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Card Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter card name"
        />

        <Text style={styles.label}>Credit Limit</Text>
        <TextInput
          style={styles.input}
          value={limit}
          onChangeText={setLimit}
          placeholder="Enter credit limit"
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Adding...' : 'Add Card'}
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
