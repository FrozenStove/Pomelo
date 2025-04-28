import creditService from "../creditService";
import { testCreditLimits } from "../pseudoDb";

describe("Credit Service", () => {
  beforeEach(() => {
    // Reset the test data before each test
    testCreditLimits.forEach((user) => {
      user.creditLimit = user.id === 123 ? 1000 : user.id === 456 ? 2000 : 3000;
      user.availableCredit = user.creditLimit;
      user.payableBalance = 0;
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
