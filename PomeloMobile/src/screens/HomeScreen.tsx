import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery, gql} from '@apollo/client';
import {useUser} from '../context/UserContext';
import {RootStackParamList} from '../types/navigation';

const GET_USER_CREDIT_SUMMARY = gql`
  query GetUserCreditSummary($userId: ID!) {
    user(id: $userId) {
      id
      name
      creditCards {
        id
        name
        balance
        limit
      }
      totalBalance
      totalLimit
    }
  }
`;

export const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {user} = useUser();

  const {loading, error, data} = useQuery(GET_USER_CREDIT_SUMMARY, {
    variables: {userId: user?.id},
    skip: !user?.id,
  });

  if (loading) {
    return <Text style={styles.text}>Loading...</Text>;
  }
  if (error) {
    return <Text style={styles.text}>Error: {error.message}</Text>;
  }

  const creditSummary = data?.user;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Credit Summary</Text>
          <Text style={styles.subtitle}>Welcome, {creditSummary?.name}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overall Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Total Balance:</Text>
            <Text style={styles.value}>
              ${creditSummary?.totalBalance.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Total Limit:</Text>
            <Text style={styles.value}>
              ${creditSummary?.totalLimit.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.cardsSection}>
          <Text style={styles.sectionTitle}>Your Credit Cards</Text>
          {creditSummary?.creditCards.map((card: any) => (
            <View key={card.id} style={styles.cardItem}>
              <Text style={styles.cardName}>{card.name}</Text>
              <View style={styles.cardDetails}>
                <Text style={styles.cardBalance}>
                  Balance: ${card.balance.toFixed(2)}
                </Text>
                <Text style={styles.cardLimit}>
                  Limit: ${card.limit.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddTransaction')}>
          <Text style={styles.buttonText}>Add Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddCard')}>
          <Text style={styles.buttonText}>Add Card</Text>
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
});
