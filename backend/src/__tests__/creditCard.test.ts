import { makeExecutableSchema } from "@graphql-tools/schema";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";
import { resolvers } from "../resolvers/resolvers";
import creditService from "../services/creditService";
import transactionService from "../services/transactionService";
import { graphql, GraphQLSchema } from "graphql";
import { CreditTransactionSummary } from "../models/userModel";

// Load the schema
const typeDefs = loadFilesSync(path.join(__dirname, "../graphql"), {
  extensions: ["graphql"],
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Type definitions for GraphQL responses
interface CreditSummary {
  availableCredit: number;
  payableBalance: number;
  settledTransactions: CreditTransactionSummary[];
  pendingTransactions: CreditTransactionSummary[];
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: any[];
}

async function executeGraphQL<T>(
  schema: GraphQLSchema,
  source: string,
  variableValues?: Record<string, any>
): Promise<GraphQLResponse<T>> {
  return graphql({
    schema,
    source,
    variableValues,
  }) as Promise<GraphQLResponse<T>>;
}

describe("Credit Card GraphQL API", () => {
  const testUserId = "123";
  const testCreditLimit = 1000;
  const testTimestamp = Math.floor(Date.now() / 1000); // Convert to seconds

  beforeEach(() => {
    // Initialize test data
    jest.clearAllMocks();

    // Initialize a credit card first
    const initMutation = `
      mutation InitializeCreditCard($userId: ID!, $creditLimit: Int!) {
        initializeCreditCard(userId: $userId, creditLimit: $creditLimit) {
          availableCredit
          payableBalance
        }
      }
    `;

    return executeGraphQL(schema, initMutation, {
      userId: testUserId,
      creditLimit: testCreditLimit,
    });
  });

  describe("Queries", () => {
    it("should return credit summary for a user", async () => {
      const query = `
        query GetCreditSummary($userId: ID!) {
          creditSummary(userId: $userId) {
            availableCredit
            payableBalance
            settledTransactions {
              id
              amount
              initialTime
            }
            pendingTransactions {
              id
              amount
              initialTime
            }
          }
        }
      `;

      const result = await executeGraphQL<{ creditSummary: CreditSummary }>(
        schema,
        query,
        { userId: testUserId }
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.creditSummary).toBeDefined();
      expect(typeof result.data?.creditSummary.availableCredit).toBe("number");
      expect(typeof result.data?.creditSummary.payableBalance).toBe("number");
    });

    it("should return transaction history for a user", async () => {
      // First create a transaction
      const authMutation = `
        mutation ProcessTransaction(
          $userId: ID!
          $eventType: EventType!
          $input: TransactionInput!
        ) {
          processTransactionEvent(
            userId: $userId
            eventType: $eventType
            input: $input
          ) {
            id
            amount
            initialTime
          }
        }
      `;

      await executeGraphQL(schema, authMutation, {
        userId: testUserId,
        eventType: "TXN_AUTHED",
        input: {
          txnId: "test-txn-1",
          amount: 100,
          eventTime: testTimestamp,
        },
      });

      const query = `
        query GetTransactionHistory($userId: ID!) {
          transactionHistory(userId: $userId) {
            id
            amount
            initialTime
            finalTime
          }
        }
      `;

      const result = await executeGraphQL<{
        transactionHistory: CreditTransactionSummary[];
      }>(schema, query, { userId: testUserId });

      expect(result.errors).toBeUndefined();
      expect(Array.isArray(result.data?.transactionHistory)).toBe(true);
    });
  });

  describe("Mutations", () => {
    it("should initialize a credit card", async () => {
      const mutation = `
        mutation InitializeCreditCard($userId: ID!, $creditLimit: Int!) {
          initializeCreditCard(userId: $userId, creditLimit: $creditLimit) {
            availableCredit
            payableBalance
          }
        }
      `;

      const result = await executeGraphQL<{
        initializeCreditCard: CreditSummary;
      }>(schema, mutation, {
        userId: testUserId,
        creditLimit: testCreditLimit,
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.initializeCreditCard.availableCredit).toBe(
        testCreditLimit
      );
      expect(result.data?.initializeCreditCard.payableBalance).toBe(0);
    });

    it("should process a transaction event", async () => {
      const mutation = `
        mutation ProcessTransaction(
          $userId: ID!
          $eventType: EventType!
          $input: TransactionInput!
        ) {
          processTransactionEvent(
            userId: $userId
            eventType: $eventType
            input: $input
          ) {
            id
            amount
            initialTime
            finalTime
          }
        }
      `;

      const result = await executeGraphQL<{
        processTransactionEvent: CreditTransactionSummary;
      }>(schema, mutation, {
        userId: testUserId,
        eventType: "TXN_AUTHED",
        input: {
          txnId: "test-txn-1",
          amount: 100,
          eventTime: testTimestamp,
        },
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.processTransactionEvent).toBeDefined();
      expect(result.data?.processTransactionEvent.amount).toBe(100);
    });
  });
});
