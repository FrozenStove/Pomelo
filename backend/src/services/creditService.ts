import {
  CreditSummary,
  EventType,
  Transaction,
} from "../models/transactionModel";
import { User } from "../models/userModel";
import { testCreditLimits } from "./pseudoDb";
import transactionStatusService from "./transactionStatusService";

type CreditService = {
  getCreditSummary: (userId: number) => CreditSummary | null;
  //   getTransactionHistory: (userId: string) => Transaction[];
  getCreditLimitByUserId: (userId: number) => number;
  getPayableBalanceByUserId: (userId: number) => number;
  getAvailableCreditByUserId: (userId: number) => number;
  updateCreditLimit: (userId: number, creditLimit: number) => void;
  updatePayableBalance: (userId: number, payableBalance: number) => void;
};

class CreditServiceImpl implements CreditService {
  getCreditSummary(userId: number): CreditSummary | null {
    const availableCredit = this.getAvailableCreditByUserId(userId);
    const payableBalance = this.getPayableBalanceByUserId(userId);

    if (!availableCredit) {
      return null;
    }

    const transactionStatuses =
      transactionStatusService.getTransactionStatusByUserId(userId);

    const settledTransactions = transactionStatuses
      .filter((t) => t.lastEventType === EventType.TXN_SETTLED)
      .map((t) => ({
        id: t.id,
        amount: t.amount,
        initialTime: t.initialTime,
        finalTime: t.finalTime,
      }));

    const pendingTransactions = transactionStatuses
      .filter((t) => t.lastEventType === EventType.TXN_AUTHED)
      .map((t) => ({
        id: t.id,
        amount: t.amount,
        initialTime: t.initialTime,
        finalTime: t.finalTime,
      }));

    return {
      availableCredit: availableCredit,
      payableBalance: payableBalance,
      settledTransactions: settledTransactions.sort(
        (a, b) => b.initialTime - a.initialTime
      ),
      pendingTransactions: pendingTransactions.sort(
        (a, b) => b.initialTime - a.initialTime
      ),
    };
  }

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
