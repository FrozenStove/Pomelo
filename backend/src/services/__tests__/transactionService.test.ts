import transactionService from "../transactionService";
import creditService from "../creditService";
import { testTransactions, testCreditLimits } from "../pseudoDb";
import { EventType, Transaction } from "../../models/transactionModel";
import { TransactionError } from "../../utils/errorUtils";

describe("Transaction Service", () => {
  beforeEach(() => {
    // Reset the test data before each test
    testTransactions.length = 0;
    testCreditLimits.forEach((user) => {
      user.creditLimit = user.id === 123 ? 1000 : user.id === 456 ? 2000 : 3000;
      user.availableCredit = user.creditLimit;
      user.payableBalance = 0;
    });
  });

  describe("getTransactionsByUserId", () => {
    it("should return transactions for a valid user", () => {
      // Add some test transactions
      const txn1: Transaction = {
        id: 1,
        txnId: "txn1",
        userId: 123,
        type: EventType.TXN_AUTHED,
        amount: 100,
        time: Date.now(),
      };
      const txn2: Transaction = {
        id: 2,
        txnId: "txn2",
        userId: 123,
        type: EventType.TXN_SETTLED,
        amount: 100,
        time: Date.now() + 1000,
      };
      const txn3: Transaction = {
        id: 3,
        txnId: "txn3",
        userId: 456,
        type: EventType.TXN_AUTHED,
        amount: 200,
        time: Date.now() + 2000,
      };

      testTransactions.push(txn1, txn2, txn3);

      const userTransactions = transactionService.getTransactionsByUserId({
        userId: 123,
      });
      expect(userTransactions.length).toBe(2);
      expect(userTransactions[0].txnId).toBe("txn1");
      expect(userTransactions[1].txnId).toBe("txn2");
    });

    it("should return empty array for user with no transactions", () => {
      const userTransactions = transactionService.getTransactionsByUserId({
        userId: 999,
      });
      expect(userTransactions).toEqual([]);
    });
  });

  describe("getTransactionByTxnId", () => {
    it("should return transactions with matching txnId", () => {
      // Add some test transactions
      const txn1: Transaction = {
        id: 1,
        txnId: "txn1",
        userId: 123,
        type: EventType.TXN_AUTHED,
        amount: 100,
        time: Date.now(),
      };
      const txn2: Transaction = {
        id: 2,
        txnId: "txn1",
        userId: 123,
        type: EventType.TXN_SETTLED,
        amount: 100,
        time: Date.now() + 1000,
      };

      testTransactions.push(txn1, txn2);

      const txnResults = transactionService.getTransactionByTxnId("txn1");
      expect(txnResults?.length).toBe(2);
      expect(txnResults?.[0].type).toBe(EventType.TXN_AUTHED);
      expect(txnResults?.[1].type).toBe(EventType.TXN_SETTLED);
    });

    it("should return undefined for non-existent txnId", () => {
      const txnResults =
        transactionService.getTransactionByTxnId("nonexistent");
      expect(txnResults).toEqual([]);
    });
  });

  describe("addTransaction", () => {
    it("should add a valid TXN_AUTHED transaction", () => {
      const txn: Transaction = {
        id: 1,
        txnId: "txn1",
        userId: 123,
        type: EventType.TXN_AUTHED,
        amount: 100,
        time: Date.now(),
      };

      transactionService.addTransaction(txn);

      expect(testTransactions.length).toBe(1);
      expect(testTransactions[0].txnId).toBe("txn1");
      expect(creditService.getAvailableCreditByUserId(123)).toBe(900); // 1000 - 100
    });

    it("should throw error for TXN_AUTHED with amount exceeding available credit", () => {
      const txn: Transaction = {
        id: 1,
        txnId: "txn1",
        userId: 123,
        type: EventType.TXN_AUTHED,
        amount: 1500, // More than available credit (1000)
        time: Date.now(),
      };

      expect(() => transactionService.addTransaction(txn)).toThrow(
        TransactionError
      );
      expect(testTransactions.length).toBe(0);
      expect(creditService.getAvailableCreditByUserId(123)).toBe(1000); // Unchanged
    });

    it("should add a valid TXN_SETTLED transaction after TXN_AUTHED", () => {
      // First add an auth transaction
      const authTxn: Transaction = {
        id: 1,
        txnId: "txn1",
        userId: 123,
        type: EventType.TXN_AUTHED,
        amount: 100,
        time: Date.now(),
      };
      transactionService.addTransaction(authTxn);

      // Then add a settlement transaction
      const settleTxn: Transaction = {
        id: 2,
        txnId: "txn1",
        userId: 123,
        type: EventType.TXN_SETTLED,
        amount: 100,
        time: Date.now() + 1000,
      };
      transactionService.addTransaction(settleTxn);

      expect(testTransactions.length).toBe(2);
      expect(creditService.getPayableBalanceByUserId(123)).toBe(100);
    });

    it("should throw error for TXN_SETTLED without prior TXN_AUTHED", () => {
      const txn: Transaction = {
        id: 1,
        txnId: "txn5",
        userId: 123,
        type: EventType.TXN_SETTLED,
        amount: 100,
        time: Date.now(),
      };

      expect(() => transactionService.addTransaction(txn)).toThrow(
        TransactionError
      );
      expect(testTransactions.length).toBe(0);
    });

    it("should add a valid PAYMENT_INITIATED transaction", () => {
      // First add auth and settlement transactions to create a payable balance
      const authTxn: Transaction = {
        id: 1,
        txnId: "txn1",
        userId: 123,
        type: EventType.TXN_AUTHED,
        amount: 100,
        time: Date.now(),
      };
      const settleTxn: Transaction = {
        id: 2,
        txnId: "txn1",
        userId: 123,
        type: EventType.TXN_SETTLED,
        amount: 100,
        time: Date.now() + 1000,
      };
      transactionService.addTransaction(authTxn);
      transactionService.addTransaction(settleTxn);

      // Then add a payment transaction
      const paymentTxn: Transaction = {
        id: 3,
        txnId: "payment1",
        userId: 123,
        type: EventType.PAYMENT_INITIATED,
        amount: -50, // Negative amount for payment
        time: Date.now() + 2000,
      };
      transactionService.addTransaction(paymentTxn);

      expect(testTransactions.length).toBe(3);
      expect(creditService.getPayableBalanceByUserId(123)).toBe(50); // 100 - 50
    });

    it("should throw error for PAYMENT_INITIATED with positive amount", () => {
      const txn: Transaction = {
        id: 1,
        txnId: "payment1",
        userId: 123,
        type: EventType.PAYMENT_INITIATED,
        amount: 50, // Positive amount (should be negative)
        time: Date.now(),
      };

      expect(() => transactionService.addTransaction(txn)).toThrow(
        TransactionError
      );
      expect(testTransactions.length).toBe(0);
    });
  });
});
