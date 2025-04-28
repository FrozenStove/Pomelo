import { User } from "../models/userModel";

const testCreditLimits: User[] = [
  {
    id: 123,
    username: "user1",
    email: "user1@example.com",
    password: "password1",
    creditLimit: 1000,
    availableCredit: 1000,
    payableBalance: 0,
    name: "User 1",
  },
  {
    id: 456,
    username: "user2",
    email: "user2@example.com",
    password: "password2",
    creditLimit: 2000,
    availableCredit: 2000,
    payableBalance: 0,
    name: "User 2",
  },
  {
    id: 789,
    username: "user3",
    email: "user3@example.com",
    password: "password3",
    creditLimit: 3000,
    availableCredit: 3000,
    payableBalance: 0,
    name: "User 3",
  },
];

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
