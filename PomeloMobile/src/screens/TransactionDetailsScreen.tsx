import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootNavigator";

type TransactionDetailsScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "TransactionDetails"
  >;
  route: RouteProp<RootStackParamList, "TransactionDetails">;
};

const TransactionDetailsScreen = ({ route }: TransactionDetailsScreenProps) => {
  const { transactionId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction Details</Text>
      <Text style={styles.transactionId}>ID: {transactionId}</Text>
      {/* Add more transaction details here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000000",
  },
  transactionId: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
});

export default TransactionDetailsScreen;
