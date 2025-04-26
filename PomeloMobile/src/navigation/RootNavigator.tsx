import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import TransactionDetailsScreen from "../screens/TransactionDetailsScreen";

export type RootStackParamList = {
  Home: undefined;
  TransactionDetails: { transactionId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#000000",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Pomelo" }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ title: "Transaction Details" }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
