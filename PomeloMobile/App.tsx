/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ApolloProvider} from '@apollo/client';
import {client} from './src/apollo/client';
import {UserProvider} from './src/context/UserContext';
import {HomeScreen} from './src/screens/HomeScreen';
import {AddTransactionScreen} from './src/screens/AddTransactionScreen';
import {InitializeCreditCardScreen} from './src/screens/InitializeCreditCardScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <ApolloProvider client={client}>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Pomelo',
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{
                title: 'Add Transaction',
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen
              name="InitializeCreditCard"
              component={InitializeCreditCardScreen}
              options={{title: 'Initialize Credit Card'}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </ApolloProvider>
  );
};

export default App;
