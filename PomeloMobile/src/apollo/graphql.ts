import {gql} from '@apollo/client';

export const GET_USER_CREDIT_SUMMARY = gql`
  query GetUserCreditSummary($userId: ID!) {
    creditSummary(userId: $userId) {
      availableCredit
      payableBalance
      pendingTransactions {
        id
        amount
        initialTime
        finalTime
      }
      settledTransactions {
        id
        amount
        initialTime
        finalTime
      }
    }
  }
`;
