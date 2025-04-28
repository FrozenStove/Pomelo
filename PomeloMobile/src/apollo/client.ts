import {ApolloClient, InMemoryCache, createHttpLink} from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql', // Update this with your GraphQL server URL
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
