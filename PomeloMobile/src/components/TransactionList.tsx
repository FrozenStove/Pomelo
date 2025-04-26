import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

type Transaction = {
  id: string;
  amount: number;
  date: string;
  status: "pending" | "settled";
};

type TransactionListProps = {
  onTransactionPress: (transactionId: string) => void;
};

const TransactionList = ({ onTransactionPress }: TransactionListProps) => {
  // This would typically come from an API or state management
  const transactions: Transaction[] = [
    {
      id: "t1",
      amount: 123,
      date: "2024-03-26",
      status: "pending",
    },
    {
      id: "t2",
      amount: 456,
      date: "2024-03-25",
      status: "settled",
    },
  ];

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => onTransactionPress(item.id)}
    >
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionId}>Transaction {item.id}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={styles.amount}>${item.amount}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.id}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    borderRadius: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#666666",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    color: "#666666",
    textTransform: "capitalize",
  },
});

export default TransactionList;
