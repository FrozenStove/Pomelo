import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CreditSummary = () => {
  return (
    <View style={styles.container}>
      <View style={styles.summaryItem}>
        <Text style={styles.label}>Available Credit</Text>
        <Text style={styles.amount}>$1,000</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.label}>Payable Balance</Text>
        <Text style={styles.amount}>$0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
});

export default CreditSummary;
