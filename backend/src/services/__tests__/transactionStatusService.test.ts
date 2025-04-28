import transactionStatusService from "../transactionStatusService";
import { testTransactionStatuses } from "../pseudoDb";
import { EventType, Transaction } from "../../models/transactionModel";
import { Status } from "../../models/transactionStatusModel";

describe("Transaction Status Service", () => {
  beforeEach(() => {
    // Reset the test data before each test
    testTransactionStatuses.length = 0;
  });

  describe("getTransactionStatusByUserId", () => {
    it("should return transaction statuses for a valid user", () => {
      // Add some test transaction statuses
      const status1 = {
        id: "status_user_txn1",
        userId: 123,
        amount: 100,
        lastEventType: EventType.TXN_AUTHED,
        status: Status.PENDING,
        initialTime: Date.now(),
      };
      const status2 = {
        id: "status_user_txn2",
        userId: 123,
        amount: 200,
        lastEventType: EventType.TXN_SETTLED,
        status: Status.SETTLED,
        initialTime: Date.now() + 1000,
        finalTime: Date.now() + 2000,
      };
      const status3 = {
        id: "status_user_txn3",
        userId: 456,
        amount: 300,
        lastEventType: EventType.TXN_AUTHED,
        status: Status.PENDING,
        initialTime: Date.now() + 3000,
      };

      testTransactionStatuses.push(status1, status2, status3);

      const userStatuses =
        transactionStatusService.getTransactionStatusByUserId(123);
      expect(userStatuses.length).toBe(2);
      expect(userStatuses[0].id).toBe("status_user_txn1");
      expect(userStatuses[1].id).toBe("status_user_txn2");
    });

    it("should return empty array for user with no transaction statuses", () => {
      const userStatuses =
        transactionStatusService.getTransactionStatusByUserId(999);
      expect(userStatuses).toEqual([]);
    });
  });

  describe("getTransactionStatusByTxnId", () => {
    it("should return transaction status for a valid txnId", () => {
      const status = {
        id: "status_txn1",
        userId: 123,
        amount: 100,
        lastEventType: EventType.TXN_AUTHED,
        status: Status.PENDING,
        initialTime: Date.now(),
      };

      testTransactionStatuses.push(status);

      const result =
        transactionStatusService.getTransactionStatusByTxnId("status_txn1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("status_txn1");
      expect(result?.userId).toBe(123);
    });

    it("should return undefined for non-existent txnId", () => {
      const result =
        transactionStatusService.getTransactionStatusByTxnId("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("addTransactionStatus", () => {
    it("should add a new transaction status", () => {
      const transaction: Transaction = {
        id: 1,
        txnId: "add_status_txn1",
        userId: 123,
        type: EventType.TXN_AUTHED,
        amount: 100,
        time: Date.now(),
      };

      transactionStatusService.addTransactionStatus(transaction);

      expect(testTransactionStatuses.length).toBe(1);
      expect(testTransactionStatuses[0].id).toBe("add_status_txn1");
      expect(testTransactionStatuses[0].status).toBe(Status.PENDING);
      expect(testTransactionStatuses[0].amount).toBe(100);
    });

    it("should handle transaction with undefined amount", () => {
      const transaction: Transaction = {
        id: 1,
        txnId: "add_status_txn2",
        userId: 123,
        type: EventType.TXN_AUTHED,
        time: Date.now(),
      };

      transactionStatusService.addTransactionStatus(transaction);

      expect(testTransactionStatuses.length).toBe(1);
      expect(testTransactionStatuses[0].amount).toBe(0);
    });
  });

  describe("updateTransactionStatus", () => {
    it("should update existing transaction status for TXN_AUTHED", () => {
      // First add a transaction status
      const initialTransaction: Transaction = {
        id: 1,
        txnId: "update_status_txn1",
        userId: 123,
        type: EventType.TXN_AUTHED,
        amount: 100,
        time: Date.now(),
      };
      transactionStatusService.addTransactionStatus(initialTransaction);

      // Then update it
      const updateTransaction: Transaction = {
        id: 2,
        txnId: "update_status_txn1",
        userId: 123,
        type: EventType.TXN_AUTHED,
        amount: 150,
        time: Date.now() + 1000,
      };
      transactionStatusService.updateTransactionStatus(updateTransaction);

      expect(testTransactionStatuses.length).toBe(1);
      expect(testTransactionStatuses[0].amount).toBe(150);
      expect(testTransactionStatuses[0].status).toBe(Status.PENDING);
    });

    it("should update existing transaction status for TXN_SETTLED", () => {
      // First add a transaction status
      const initialTransaction: Transaction = {
        id: 1,
        txnId: "update_status_txn2",
        userId: 123,
        type: EventType.TXN_AUTHED,
        amount: 100,
        time: Date.now(),
      };
      transactionStatusService.addTransactionStatus(initialTransaction);

      // Then update it to settled
      const updateTransaction: Transaction = {
        id: 2,
        txnId: "update_status_txn2",
        userId: 123,
        type: EventType.TXN_SETTLED,
        amount: 100,
        time: Date.now() + 1000,
      };
      transactionStatusService.updateTransactionStatus(updateTransaction);

      expect(testTransactionStatuses.length).toBe(1);
      expect(testTransactionStatuses[0].status).toBe(Status.SETTLED);
      expect(testTransactionStatuses[0].lastEventType).toBe(
        EventType.TXN_SETTLED
      );
    });

    it("should update existing transaction status for TXN_AUTH_CLEARED", () => {
      // First add a transaction status
      const initialTransaction: Transaction = {
        id: 1,
        txnId: "update_status_txn3",
        userId: 123,
        type: EventType.TXN_AUTHED,
        amount: 100,
        time: Date.now(),
      };
      transactionStatusService.addTransactionStatus(initialTransaction);

      // Then update it to cancelled
      const updateTransaction: Transaction = {
        id: 2,
        txnId: "update_status_txn3",
        userId: 123,
        type: EventType.TXN_AUTH_CLEARED,
        time: Date.now() + 1000,
      };
      transactionStatusService.updateTransactionStatus(updateTransaction);

      expect(testTransactionStatuses.length).toBe(1);
      expect(testTransactionStatuses[0].status).toBe(Status.CANCELLED);
      expect(testTransactionStatuses[0].lastEventType).toBe(
        EventType.TXN_AUTH_CLEARED
      );
    });

    it("should create new transaction status if none exists", () => {
      const transaction: Transaction = {
        id: 1,
        txnId: "update_status_txn4",
        userId: 123,
        type: EventType.TXN_SETTLED,
        amount: 100,
        time: Date.now(),
      };

      transactionStatusService.updateTransactionStatus(transaction);

      expect(testTransactionStatuses.length).toBe(1);
      expect(testTransactionStatuses[0].status).toBe(Status.SETTLED);
      expect(testTransactionStatuses[0].lastEventType).toBe(
        EventType.TXN_SETTLED
      );
    });
  });
});
