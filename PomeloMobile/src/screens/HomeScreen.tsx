import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useUser} from '../context/UserContext';
import {RootStackParamList} from '../types/navigation';
import {ErrorDisplay} from '../components/ErrorDisplay';

export const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    user,
    setUser,
    creditSummary,
    userLoading,
    userError,
    refetchCreditSummary,
  } = useUser();
  const [newUserId, setNewUserId] = useState('');
  const [dismissedError, setDismissedError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchCreditSummary();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchCreditSummary]);

  const handleSetUser = () => {
    console.log('newUserId', newUserId);
    if (!newUserId) {
      Alert.alert('Error', 'Please enter a user ID');
      return;
    }

    setUser({
      id: newUserId,
    });
    setNewUserId('');
  };

  if (userLoading) {
    return <Text style={styles.text}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.userSelector}>
        <TextInput
          style={styles.userInput}
          value={newUserId}
          onChangeText={setNewUserId}
          placeholder="Enter user ID"
          keyboardType="default"
        />
        <TouchableOpacity style={styles.setUserButton} onPress={handleSetUser}>
          <Text style={styles.setUserButtonText}>Set User</Text>
        </TouchableOpacity>
      </View>

      {userError && !dismissedError && (
        <ErrorDisplay
          error={userError}
          onDismiss={() => setDismissedError(true)}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']} // Android
            tintColor="#007AFF" // iOS
          />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>Credit Summary</Text>
          <Text style={styles.subtitle}>
            Current userId = {user?.id || 'Not Set'}
          </Text>
        </View>

        {user?.id ? (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Overall Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.label}>Available Credit:</Text>
                <Text style={styles.value}>
                  ${creditSummary?.availableCredit?.toFixed(2) || '0.00'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.label}>Payable Balance:</Text>
                <Text style={styles.value}>
                  ${creditSummary?.payableBalance?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>

            {/* Pending Transactions Section */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Pending Transactions</Text>
              {creditSummary?.pendingTransactions?.length ? (
                creditSummary.pendingTransactions.map(txn => (
                  <View key={txn.id} style={styles.transactionItem}>
                    <Text style={styles.transactionAmount}>
                      Amount: ${txn.amount.toFixed(2)}
                    </Text>
                    <Text style={styles.transactionTime}>
                      Started: {txn.initialTime}
                    </Text>
                    <Text style={styles.transactionId}>
                      Transaction ID: {txn.id}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.label}>No pending transactions</Text>
              )}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Settled Transactions</Text>
              {creditSummary?.settledTransactions?.length ? (
                creditSummary.settledTransactions.map(txn => (
                  <View key={txn.id} style={styles.transactionItem}>
                    <Text style={styles.transactionAmount}>
                      Amount: ${txn.amount.toFixed(2)}
                    </Text>
                    <Text style={styles.transactionTime}>
                      Started: {txn.initialTime}
                    </Text>
                    <Text style={styles.transactionTime}>
                      Settled: {txn.finalTime}
                    </Text>
                    <Text style={styles.transactionId}>
                      Transaction ID: {txn.id}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.label}>No settled transactions</Text>
              )}
            </View>
          </>
        ) : (
          <View style={styles.noUserContainer}>
            <Text style={styles.noUserText}>
              Please set a user ID to view credit summary
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddTransaction')}>
          <Text style={styles.buttonText}>Add Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('InitializeCreditCard')}>
          <Text style={styles.buttonText}>Init Card</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userSelector: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  setUserButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  setUserButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  summaryCard: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardsSection: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardBalance: {
    color: '#666',
  },
  cardLimit: {
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 50,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  noUserContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noUserText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  transactionId: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  transactionItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 14,
    color: '#666',
  },
});
