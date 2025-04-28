import creditService from "../creditService";
import { testCreditLimits } from "../pseudoDb";
import { testTransactionStatuses } from "../pseudoDb";
import { Status } from "../../models/transactionStatusModel";
import { EventType } from "../../models/transactionModel";

describe("Credit Service", () => {
  beforeEach(() => {
    // Reset the test data before each test
    testCreditLimits.forEach((user) => {
      user.creditLimit = user.id === 123 ? 1000 : user.id === 456 ? 2000 : 3000;
      user.availableCredit = user.creditLimit;
      user.payableBalance = 0;
    });
    testTransactionStatuses.length = 0;
  });

  describe("getCreditSummary", () => {
    it("should return credit summary for a valid user with transactions", () => {
      // Add some test transaction statuses
      const status1 = {
        id: "summary_txn1",
        userId: 123,
        amount: 100,
        lastEventType: EventType.TXN_AUTHED,
        status: Status.PENDING,
        initialTime: 1,
      };
      const status2 = {
        id: "summary_txn2",
        userId: 123,
        amount: 200,
        lastEventType: EventType.TXN_SETTLED,
        status: Status.SETTLED,
        initialTime: 2,
        finalTime: 3,
      };
      testTransactionStatuses.push(status1, status2);

      // Update user's credit information
      const user = testCreditLimits.find((u) => u.id === 123);
      if (user) {
        user.availableCredit = 700; // 1000 - 300 (total of both transactions)
        user.payableBalance = 200; // Only the settled transaction
      }

      const summary = creditService.getCreditSummary(123);
      expect(summary).not.toBeNull();
      if (summary) {
        expect(summary.availableCredit).toBe(700);
        expect(summary.payableBalance).toBe(200);
        expect(summary.pendingTransactions.length).toBe(1);
        expect(summary.settledTransactions.length).toBe(1);
        expect(summary.pendingTransactions[0].id).toBe("summary_txn1");
        expect(summary.settledTransactions[0].id).toBe("summary_txn2");
      }
    });

    it("should return null for non-existent user", () => {
      const summary = creditService.getCreditSummary(999);
      expect(summary).toBeNull();
    });

    it("should return empty transaction lists for user with no transactions", () => {
      const summary = creditService.getCreditSummary(123);
      expect(summary).not.toBeNull();
      if (summary) {
        expect(summary.availableCredit).toBe(1000);
        expect(summary.payableBalance).toBe(0);
        expect(summary.pendingTransactions).toEqual([]);
        expect(summary.settledTransactions).toEqual([]);
      }
    });

    it("should sort transactions by time in descending order", () => {
      // Add transactions with different timestamps
      const status1 = {
        id: "sort_txn1",
        userId: 123,
        amount: 100,
        lastEventType: EventType.TXN_AUTHED,
        status: Status.PENDING,
        initialTime: 1,
      };
      const status2 = {
        id: "sort_txn2",
        userId: 123,
        amount: 200,
        lastEventType: EventType.TXN_AUTHED,
        status: Status.PENDING,
        initialTime: 2,
      };
      const status3 = {
        id: "sort_txn3",
        userId: 123,
        amount: 300,
        lastEventType: EventType.TXN_SETTLED,
        status: Status.SETTLED,
        initialTime: 3,
        finalTime: 4,
      };
      testTransactionStatuses.push(status1, status2, status3);

      const summary = creditService.getCreditSummary(123);
      expect(summary).not.toBeNull();
      if (summary) {
        expect(summary.pendingTransactions.length).toBe(2);
        expect(summary.settledTransactions.length).toBe(1);
        expect(summary.pendingTransactions[0].id).toBe("sort_txn2"); // Most recent
        expect(summary.pendingTransactions[1].id).toBe("sort_txn1"); // Oldest
        expect(summary.settledTransactions[0].id).toBe("sort_txn3");
      }
    });
  });

  describe("getCreditLimitByUserId", () => {
    it("should return the correct credit limit for a valid user", () => {
      expect(creditService.getCreditLimitByUserId(123)).toBe(1000);
      expect(creditService.getCreditLimitByUserId(456)).toBe(2000);
      expect(creditService.getCreditLimitByUserId(789)).toBe(3000);
    });

    it("should return 0 for a non-existent user", () => {
      expect(creditService.getCreditLimitByUserId(999)).toBe(0);
    });
  });

  describe("getPayableBalanceByUserId", () => {
    it("should return the correct payable balance for a valid user", () => {
      expect(creditService.getPayableBalanceByUserId(123)).toBe(0);
    });

    it("should return 0 for a non-existent user", () => {
      expect(creditService.getPayableBalanceByUserId(999)).toBe(0);
    });
  });

  describe("getAvailableCreditByUserId", () => {
    it("should return the correct available credit for a valid user", () => {
      expect(creditService.getAvailableCreditByUserId(123)).toBe(1000);
      expect(creditService.getAvailableCreditByUserId(456)).toBe(2000);
      expect(creditService.getAvailableCreditByUserId(789)).toBe(3000);
    });

    it("should return 0 for a non-existent user", () => {
      expect(creditService.getAvailableCreditByUserId(999)).toBe(0);
    });
  });

  describe("updateCreditLimit", () => {
    it("should update the credit limit for a valid user", () => {
      creditService.updateCreditLimit(123, 1500);
      expect(creditService.getCreditLimitByUserId(123)).toBe(1500);
    });

    it("should throw an error for a non-existent user", () => {
      expect(() => creditService.updateCreditLimit(999, 1000)).toThrow(
        "User 999 not found"
      );
    });
  });

  describe("updatePayableBalance", () => {
    it("should update the payable balance for a valid user", () => {
      creditService.updatePayableBalance(123, 500);
      expect(creditService.getPayableBalanceByUserId(123)).toBe(500);
    });

    it("should throw an error for a non-existent user", () => {
      expect(() => creditService.updatePayableBalance(999, 500)).toThrow(
        "User 999 not found"
      );
    });
  });

  describe("updateAvailableCredit", () => {
    it("should update the available credit for a valid user", () => {
      creditService.updateAvailableCredit(123, 800);
      expect(creditService.getAvailableCreditByUserId(123)).toBe(800);
    });

    it("should throw an error for a non-existent user", () => {
      expect(() => creditService.updateAvailableCredit(999, 800)).toThrow(
        "User 999 not found"
      );
    });
  });
});
