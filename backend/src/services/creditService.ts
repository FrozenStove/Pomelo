import { User } from "../models/userModel";
import { testCreditLimits } from "./pseudoDb";

type CreditService = {
  //   getCreditSummary: (userId: string) => CreditSummary | null;
  //   getTransactionHistory: (userId: string) => Transaction[];
  getCreditLimitByUserId: (userId: number) => number;
  getPayableBalanceByUserId: (userId: number) => number;
  getAvailableCreditByUserId: (userId: number) => number;
  updateCreditLimit: (userId: number, creditLimit: number) => void;
  updatePayableBalance: (userId: number, payableBalance: number) => void;
  updateAvailableCredit: (userId: number, availableCredit: number) => void;
};

class CreditServiceImpl implements CreditService {
  //   getCreditSummary: (userId: string) => {
  //     return creditCardService.getCreditSummary(userId);
  //   },

  getCreditLimitByUserId(userId: number) {
    return (
      testCreditLimits.find((limit) => limit.id === userId)?.creditLimit || 0
    );
  }
  getPayableBalanceByUserId(userId: number) {
    return (
      testCreditLimits.find((limit) => limit.id === userId)?.payableBalance || 0
    );
  }
  getAvailableCreditByUserId(userId: number) {
    return (
      testCreditLimits.find((limit) => limit.id === userId)?.availableCredit ||
      0
    );
  }

  updateCreditLimit(userId: number, creditLimit: number) {
    const user = testCreditLimits.find((limit) => limit.id === userId);
    if (user) {
      user.creditLimit = creditLimit;
    } else {
      throw new Error(`User ${userId} not found`);
    }
  }

  updatePayableBalance(userId: number, payableBalance: number) {
    const user = testCreditLimits.find((limit) => limit.id === userId);
    if (user) {
      user.payableBalance = payableBalance;
    } else {
      throw new Error(`User ${userId} not found`);
    }
  }

  updateAvailableCredit(userId: number, availableCredit: number) {
    const user = testCreditLimits.find((limit) => limit.id === userId);
    if (user) {
      user.availableCredit = availableCredit;
    } else {
      throw new Error(`User ${userId} not found`);
    }
  }
}

const creditService = new CreditServiceImpl();

export default creditService;
