import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { SUBGRAPH_URL } from '../../utils/constants';

const httpLink = createHttpLink({
  uri: SUBGRAPH_URL
});


export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          transferPaths: {
            keyArgs: ['where', 'orderBy', 'orderDirection'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});