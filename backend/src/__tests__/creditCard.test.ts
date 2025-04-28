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
        userId: 234,
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

describe("Transaction Lifecycle", () => {
  const lifecycleCreditLimit = 2000;
  const lifecycleTimestamp = Math.floor(Date.now() / 1000);

  it("should track credit card state through transaction lifecycle", async () => {
    const singleTestUserId = 1456;
    const testAmount = 500;
    const txnId = "lifecycle-single-txn-1";

    // Initialize a new credit card for this test
    const initMutation = `
      mutation InitializeCreditCard($userId: ID!, $creditLimit: Int!) {
        initializeCreditCard(userId: $userId, creditLimit: $creditLimit) {
          availableCredit
          payableBalance
          settledTransactions {
            id
            amount
          }
          pendingTransactions {
            id
            amount
          }
        }
      }
    `;

    await executeGraphQL<{ initializeCreditCard: CreditSummary }>(
      schema,
      initMutation,
      {
        userId: singleTestUserId.toString(),
        creditLimit: lifecycleCreditLimit,
      }
    );

    // Step 1: Verify initial state
    const initialQuery = `
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

    const initialResult = await executeGraphQL<{
      creditSummary: CreditSummary;
    }>(schema, initialQuery, { userId: singleTestUserId.toString() });

    expect(initialResult.errors).toBeUndefined();
    expect(initialResult.data?.creditSummary.availableCredit).toBe(
      lifecycleCreditLimit
    );
    expect(initialResult.data?.creditSummary.payableBalance).toBe(0);
    expect(initialResult.data?.creditSummary.settledTransactions).toHaveLength(
      0
    );
    expect(initialResult.data?.creditSummary.pendingTransactions).toHaveLength(
      0
    );

    // Step 2: Authorize a transaction
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

    const authResult = await executeGraphQL<{
      processTransactionEvent: CreditTransactionSummary;
    }>(schema, authMutation, {
      userId: singleTestUserId.toString(),
      eventType: "TXN_AUTHED",
      input: {
        txnId: txnId,
        amount: testAmount,
        eventTime: lifecycleTimestamp,
      },
    });

    expect(authResult.errors).toBeUndefined();
    expect(authResult.data?.processTransactionEvent.amount).toBe(testAmount);

    // Step 3: Verify state after authorization
    const afterAuthResult = await executeGraphQL<{
      creditSummary: CreditSummary;
    }>(schema, initialQuery, { userId: singleTestUserId.toString() });

    expect(afterAuthResult.errors).toBeUndefined();
    expect(afterAuthResult.data?.creditSummary.availableCredit).toBe(
      lifecycleCreditLimit - testAmount
    );
    expect(afterAuthResult.data?.creditSummary.payableBalance).toBe(0);
    expect(
      afterAuthResult.data?.creditSummary.settledTransactions
    ).toHaveLength(0);
    expect(
      afterAuthResult.data?.creditSummary.pendingTransactions
    ).toHaveLength(1);
    expect(
      afterAuthResult.data?.creditSummary.pendingTransactions[0].amount
    ).toBe(testAmount);

    // Step 4: Settle the transaction
    const settleResult = await executeGraphQL<{
      processTransactionEvent: CreditTransactionSummary;
    }>(schema, authMutation, {
      userId: singleTestUserId.toString(),
      eventType: "TXN_SETTLED",
      input: {
        txnId: txnId,
        amount: testAmount,
        eventTime: lifecycleTimestamp + 3600,
      },
    });

    expect(settleResult.errors).toBeUndefined();
    expect(settleResult.data?.processTransactionEvent.amount).toBe(testAmount);

    // Step 5: Verify final state after settlement
    const finalResult = await executeGraphQL<{ creditSummary: CreditSummary }>(
      schema,
      initialQuery,
      { userId: singleTestUserId.toString() }
    );

    expect(finalResult.errors).toBeUndefined();
    expect(finalResult.data?.creditSummary.availableCredit).toBe(
      lifecycleCreditLimit - testAmount
    );
    expect(finalResult.data?.creditSummary.payableBalance).toBe(testAmount);
    expect(finalResult.data?.creditSummary.settledTransactions).toHaveLength(1);
    expect(finalResult.data?.creditSummary.settledTransactions[0].amount).toBe(
      testAmount
    );
    expect(finalResult.data?.creditSummary.pendingTransactions).toHaveLength(0);
  });

  it("should handle multiple transactions correctly", async () => {
    const multiTestUserId = 1789;
    const amounts = [300, 200, 400];
    const txnIds = [
      "lifecycle-multi-txn-1",
      "lifecycle-multi-txn-2",
      "lifecycle-multi-txn-3",
    ];

    // Initialize a new credit card for this test
    const initMutation = `
      mutation InitializeCreditCard($userId: ID!, $creditLimit: Int!) {
        initializeCreditCard(userId: $userId, creditLimit: $creditLimit) {
          availableCredit
          payableBalance
          settledTransactions {
            id
            amount
          }
          pendingTransactions {
            id
            amount
          }
        }
      }
    `;

    await executeGraphQL<{ initializeCreditCard: CreditSummary }>(
      schema,
      initMutation,
      {
        userId: multiTestUserId.toString(),
        creditLimit: lifecycleCreditLimit,
      }
    );

    // Authorize multiple transactions
    for (let i = 0; i < amounts.length; i++) {
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

      await executeGraphQL<{
        processTransactionEvent: CreditTransactionSummary;
      }>(schema, authMutation, {
        userId: multiTestUserId.toString(),
        eventType: "TXN_AUTHED",
        input: {
          txnId: txnIds[i],
          amount: amounts[i],
          eventTime: lifecycleTimestamp + i,
        },
      });
    }

    // Verify state with multiple pending transactions
    const pendingQuery = `
      query GetCreditSummary($userId: ID!) {
        creditSummary(userId: $userId) {
          availableCredit
          payableBalance
          pendingTransactions {
            id
            amount
          }
        }
      }
    `;

    const pendingResult = await executeGraphQL<{
      creditSummary: CreditSummary;
    }>(schema, pendingQuery, { userId: multiTestUserId.toString() });

    expect(pendingResult.errors).toBeUndefined();
    expect(pendingResult.data?.creditSummary.availableCredit).toBe(
      lifecycleCreditLimit - amounts.reduce((a, b) => a + b, 0)
    );
    expect(pendingResult.data?.creditSummary.pendingTransactions).toHaveLength(
      3
    );
    expect(
      pendingResult.data?.creditSummary.pendingTransactions.map((t) => t.amount)
    ).toEqual(expect.arrayContaining(amounts));

    // Settle all transactions
    for (let i = 0; i < amounts.length; i++) {
      const settleMutation = `
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

      await executeGraphQL<{
        processTransactionEvent: CreditTransactionSummary;
      }>(schema, settleMutation, {
        userId: multiTestUserId.toString(),
        eventType: "TXN_SETTLED",
        input: {
          txnId: txnIds[i],
          amount: amounts[i],
          eventTime: lifecycleTimestamp + i + 3600,
        },
      });
    }

    // Verify final state
    const finalResult = await executeGraphQL<{ creditSummary: CreditSummary }>(
      schema,
      pendingQuery,
      { userId: multiTestUserId.toString() }
    );

    expect(finalResult.errors).toBeUndefined();
    expect(finalResult.data?.creditSummary.availableCredit).toBe(
      lifecycleCreditLimit - amounts.reduce((a, b) => a + b, 0)
    );
    expect(finalResult.data?.creditSummary.payableBalance).toBe(
      amounts.reduce((a, b) => a + b, 0)
    );
    expect(finalResult.data?.creditSummary.pendingTransactions).toHaveLength(0);
  });
});
