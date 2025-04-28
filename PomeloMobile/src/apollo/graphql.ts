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

export const ADD_TRANSACTION = gql`
  mutation ProcessTransactionEvent(
    $userId: ID!
    $eventType: EventType!
    $txnId: ID!
    $eventTime: Int!
    $amount: Int!
  ) {
    processTransactionEvent(
      userId: $userId
      eventType: $eventType
      input: {txnId: $txnId, eventTime: $eventTime, amount: $amount}
    ) {
      amount
    }
  }
`;
