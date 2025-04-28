import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import {onError} from '@apollo/client/link/error';

// Create an error link to handle and log errors
const errorLink = onError(({graphQLErrors, networkError, operation}) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({message, locations, path}) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      );
      console.error('Operation:', operation.operationName);
      console.error('Variables:', operation.variables);
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    console.error('Operation:', operation.operationName);
    console.error('Variables:', operation.variables);
  }
});

const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql', // Update this with your GraphQL server URL
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});
