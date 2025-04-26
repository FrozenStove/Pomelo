import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import TransactionList from "../components/TransactionList";
import CreditSummary from "../components/CreditSummary";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  return (
    <ScrollView style={styles.container}>
      <CreditSummary />
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TransactionList
          onTransactionPress={(transactionId) =>
            navigation.navigate("TransactionDetails", { transactionId })
          }
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  transactionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000000",
  },
});

export default HomeScreen;
