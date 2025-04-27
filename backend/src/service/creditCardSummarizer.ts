import {
  CreditEvent,
  CreditSummary,
  EventType,
  Transaction,
  TransactionHistory,
  TransactionInput,
} from "../models/TransactionModel";
import { TransactionError } from "../utils/errorUtils";

export class CreditCardSummarizer {
  creditLimit: number;
  payableBalance = 0;
  transactionHistoryById: Record<string, TransactionHistory[]> = {};
  transactionHistory: CreditEvent[] = [];

  constructor(args: { creditLimit: number }) {
    this.creditLimit = args.creditLimit;
  }

  summarize(): CreditSummary {
    const settledTransactions: Transaction[] = [];
    const pendingTransactions: Transaction[] = [];

    for (const txnId in this.transactionHistoryById) {
      const transactions = this.transactionHistoryById[txnId];

      const initTransaction = transactions.find(
        (txn) =>
          txn.eventType === EventType.PAYMENT_INITIATED ||
          txn.eventType === EventType.TXN_AUTHED
      );

      const finalTransaction =
        transactions.find(
          (txn) =>
            txn.eventType === EventType.PAYMENT_POSTED ||
            txn.eventType === EventType.TXN_SETTLED
        ) ||
        transactions.find(
          (txn) =>
            txn.eventType === EventType.PAYMENT_CANCELED ||
            txn.eventType === EventType.TXN_AUTH_CLEARED
        );

      if (!initTransaction || !initTransaction.amount) {
        continue;
      }

      const result: Transaction = {
        id: txnId,
        amount: finalTransaction?.amount || initTransaction.amount,
        initialTime: initTransaction.eventTime,
        finalTime: finalTransaction?.eventTime,
      };

      if (finalTransaction) {
        if (
          finalTransaction.eventType === EventType.TXN_SETTLED ||
          finalTransaction.eventType === EventType.PAYMENT_POSTED
        ) {
          settledTransactions.push(result);
        }
      } else {
        pendingTransactions.push(result);
      }
    }

    return {
      availableCredit: this.creditLimit,
      payableBalance: this.payableBalance,
      settledTransactions: settledTransactions.sort(
        (a, b) => b.initialTime - a.initialTime
      ),
      pendingTransactions: pendingTransactions.sort(
        (a, b) => b.initialTime - a.initialTime
      ),
    };
  }

  txnAuthed({ txnId: id, amount, eventTime }: TransactionInput) {
    if (!amount) {
      throw new TransactionError(
        id,
        EventType.TXN_AUTHED,
        `authorized with invalid amount ${amount}`
      );
    }
    this.transactionHistoryById[id] = [
      {
        eventType: EventType.TXN_AUTHED,
        amount: amount,
        eventTime: eventTime,
      },
    ];

    this.creditLimit -= amount;

    console.log(`${id} successfully authorized`);
  }

  txnSettled({ txnId: id, amount, eventTime }: TransactionInput) {
    this.transactionHistoryById[id].push({
      eventType: EventType.TXN_SETTLED,
      amount: amount,
      eventTime: eventTime,
    });

    const authedTxn = this.transactionHistoryById[id]?.find(
      (txn) => txn.eventType === EventType.TXN_AUTHED
    );

    if (!authedTxn) {
      throw new TransactionError(
        id,
        EventType.TXN_SETTLED,
        `No authorized transaction found`
      );
    }
    if (eventTime < authedTxn.eventTime) {
      throw new TransactionError(
        id,
        EventType.TXN_SETTLED,
        `Transaction settled before authorized`
      );
    }
    if (!authedTxn.amount) {
      throw new TransactionError(
        id,
        EventType.TXN_SETTLED,
        `authorized with invalid amount ${amount}`
      );
    }

    if (amount && amount !== authedTxn.amount) {
      console.log(
        `${id} has an updated amount from [${authedTxn.amount}] to [${amount}]`
      );
      this.creditLimit += authedTxn.amount;
      this.creditLimit -= amount;
    }

    this.payableBalance += amount || authedTxn.amount;
    console.log(`${id} successfully settled`);
  }

  txnCleared({ txnId: id, amount, eventTime }: TransactionInput) {
    this.transactionHistoryById[id].push({
      eventType: EventType.TXN_AUTH_CLEARED,
      amount: amount,
      eventTime: eventTime,
    });

    const authedTxn = this.transactionHistoryById[id]?.find(
      (txn) => txn.eventType === EventType.TXN_AUTHED
    );

    if (!authedTxn) {
      throw new TransactionError(
        id,
        EventType.TXN_AUTH_CLEARED,
        `No authorized transaction found`
      );
    }
    if (eventTime < authedTxn.eventTime) {
      throw new TransactionError(
        id,
        EventType.TXN_AUTH_CLEARED,
        `Transaction settled before authorized`
      );
    }
    if (!authedTxn.amount) {
      throw new TransactionError(
        id,
        EventType.TXN_AUTH_CLEARED,
        `authorized with invalid amount ${amount}`
      );
    }

    this.creditLimit += authedTxn.amount;
    console.log(`${id} successfully cleared`);
  }

  paymentInitiated({ txnId: id, amount, eventTime }: TransactionInput) {
    if (!amount || amount > 0) {
      throw new TransactionError(
        id,
        EventType.PAYMENT_INITIATED,
        `invalid amount`
      );
    }
    if (this.payableBalance < amount) {
      throw new TransactionError(
        id,
        EventType.PAYMENT_INITIATED,
        `over payment detected`
      );
    }

    this.transactionHistoryById[id] = [
      {
        eventType: EventType.PAYMENT_INITIATED,
        amount: amount,
        eventTime: eventTime,
      },
    ];

    this.payableBalance += amount;
    console.log(`${id} successfully initiated`);
  }

  paymentPosted({ txnId: id, eventTime }: TransactionInput) {
    this.transactionHistoryById[id].push({
      eventType: EventType.PAYMENT_POSTED,
      eventTime: eventTime,
    });
    const initTxn = this.transactionHistoryById[id]?.find(
      (txn) => txn.eventType === EventType.PAYMENT_INITIATED
    );

    if (!initTxn) {
      throw new TransactionError(
        id,
        EventType.PAYMENT_POSTED,
        `payment posted without being initiated`
      );
    }
    if (!initTxn.amount) {
      throw new TransactionError(
        id,
        EventType.PAYMENT_POSTED,
        `initiated payment has an invalid amount`
      );
    }
    if (eventTime < initTxn.eventTime) {
      throw new TransactionError(
        id,
        EventType.PAYMENT_POSTED,
        `payment posted before initiated`
      );
    }

    this.creditLimit += Math.abs(initTxn.amount);
    console.log(`${id} successfully posted`);
  }

  paymentCancelled({ txnId: id, eventTime }: TransactionInput) {
    this.transactionHistoryById[id].push({
      eventType: EventType.PAYMENT_CANCELED,
      eventTime: eventTime,
    });
    const initTxn = this.transactionHistoryById[id]?.find(
      (txn) => txn.eventType === EventType.PAYMENT_INITIATED
    );

    if (!initTxn) {
      throw new TransactionError(
        id,
        EventType.PAYMENT_CANCELED,
        `payment cancelled without being initiated`
      );
    }
    if (!initTxn.amount) {
      throw new TransactionError(
        id,
        EventType.PAYMENT_CANCELED,
        `initiated payment has an invalid amount`
      );
    }
    if (eventTime < initTxn.eventTime) {
      throw new TransactionError(
        id,
        EventType.PAYMENT_CANCELED,
        `payment cancelled before initiated`
      );
    }

    this.payableBalance -= initTxn.amount;
    console.log(`${id} successfully cancelled`);
  }
}
