import { GraphQLResolveInfo } from "graphql";
import creditService from "../services/creditService";
import transactionService from "../services/transactionService";
import { EventType, Transaction } from "../models/transactionModel";

// Resolver implementations
export const resolvers = {
  Query: {
    creditSummary: async (_: any, { userId }: { userId: string }) => {
      return creditService.getCreditSummary(parseInt(userId));
    },
    transactionHistory: async (_: any, { userId }: { userId: string }) => {
      return transactionService.getTransactionsByUserId({
        userId: parseInt(userId),
      });
    },
  },
  Mutation: {
    initializeCreditCard: async (
      _: any,
      { userId, creditLimit }: { userId: string; creditLimit: number }
    ) => {
      creditService.updateCreditLimit(parseInt(userId), creditLimit);
      return creditService.getCreditSummary(parseInt(userId));
    },
    processTransactionEvent: async (
      _: any,
      {
        userId,
        eventType,
        input,
      }: {
        userId: string;
        eventType: EventType;
        input: { txnId: string; amount?: number; eventTime: number };
      }
    ) => {
      const transaction: Transaction = {
        id: Date.now(),
        txnId: input.txnId,
        userId: parseInt(userId),
        type: eventType,
        amount: input.amount || 0,
        time: input.eventTime,
      };

      transactionService.addTransaction(transaction);

      // Return the transaction status from the transaction status service
      const transactionStatus = transactionService.getTransactionByTxnId(
        input.txnId
      );
      if (!transactionStatus || transactionStatus.length === 0) {
        throw new Error("Transaction not found after processing");
      }

      return {
        id: transactionStatus[0].txnId,
        amount: transactionStatus[0].amount || 0,
        initialTime: transactionStatus[0].time,
        finalTime: transactionStatus[0].time,
      };
    },
  },
};
