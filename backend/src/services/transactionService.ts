import { EventType, Transaction } from "../models/transactionModel";
import { TransactionError } from "../utils/errorUtils";
import creditService from "./creditService";
import { testTransactions } from "./pseudoDb";
import transactionStatusService from "./transactionStatusService";

type TransactionService = {
  getTransactionsByUserId: (req: {
    userId: number;
    startTime?: number;
    endTime?: number;
    type?: EventType;
    id?: string;
  }) => Transaction[];
  getTransactionByTxnId: (txnId: string) => Transaction[] | undefined;
  addTransaction: (transaction: Transaction) => void;
};

class TransactionServiceImpl implements TransactionService {
  getTransactionsByUserId(req: {
    userId: number;
    startTime?: number;
    endTime?: number;
    type?: EventType;
    id?: string;
  }) {
    return testTransactions.filter((t) => t.userId === req.userId);
  }

  getTransactionByTxnId(txnId: string) {
    return testTransactions.filter((t) => t.txnId === txnId);
  }

  addTransaction(transaction: Transaction) {
    console.log(
      `adding transaction ${transaction.id} of type ${transaction.type}`
    );
    switch (transaction.type) {
      case EventType.TXN_AUTHED:
        this.txnAuthed(transaction);
        break;
      case EventType.TXN_SETTLED:
        this.txnSettled(transaction);
        break;
      case EventType.TXN_AUTH_CLEARED:
        this.txnCleared(transaction);
        break;
      case EventType.PAYMENT_INITIATED:
        this.paymentInitiated(transaction);
        break;
      case EventType.PAYMENT_POSTED:
        this.paymentPosted(transaction);
        break;
      case EventType.PAYMENT_CANCELED:
        this.paymentCancelled(transaction);
        break;
      default:
        throw new TransactionError(
          transaction.txnId,
          transaction.type,
          `unsupported transaction type ${transaction.type}`
        );
    }
    testTransactions.push(transaction);
  }

  txnAuthed({ txnId, userId, amount, ...args }: Transaction) {
    const availableCredit = creditService.getAvailableCreditByUserId(userId);

    if (!amount) {
      throw new TransactionError(
        txnId,
        EventType.TXN_AUTHED,
        `authorized with invalid amount ${amount}`
      );
    }
    if (amount > availableCredit) {
      throw new TransactionError(
        txnId,
        EventType.TXN_AUTHED,
        `insufficient available credit [${availableCredit}] for transaction amount [${amount}]`
      );
    }

    creditService.updateAvailableCredit(userId, availableCredit - amount);

    // Update transaction status
    transactionStatusService.addTransactionStatus({
      txnId,
      userId,
      amount,
      ...args,
    });

    console.log(`${txnId} successfully authorized`);
  }

  txnSettled({ txnId, userId, amount, time }: Transaction) {
    const priorTransactionStatus =
      transactionStatusService.getTransactionStatusByTxnId(txnId);

    if (
      !priorTransactionStatus ||
      priorTransactionStatus.lastEventType !== EventType.TXN_AUTHED
    ) {
      throw new TransactionError(
        txnId,
        EventType.TXN_SETTLED,
        `No authorized transaction found`
      );
    }
    if (time < priorTransactionStatus.initialTime) {
      throw new TransactionError(
        txnId,
        EventType.TXN_SETTLED,
        `Transaction settled before authorized`
      );
    }

    if (amount && amount !== priorTransactionStatus.amount) {
      console.log(
        `${txnId} has an updated amount from [${priorTransactionStatus.amount}] to [${amount}]`
      );
      const availableCredit = creditService.getAvailableCreditByUserId(userId);
      creditService.updateAvailableCredit(
        userId,
        availableCredit + priorTransactionStatus.amount - amount
      );
    }
    const payableBalance = creditService.getPayableBalanceByUserId(userId);

    creditService.updatePayableBalance(
      userId,
      payableBalance + (amount || priorTransactionStatus.amount)
    );

    console.log(`${txnId} successfully settled`);
  }

  txnCleared({ txnId, userId, amount, time }: Transaction) {
    const priorTransactionStatus =
      transactionStatusService.getTransactionStatusByTxnId(txnId);

    if (
      !priorTransactionStatus ||
      priorTransactionStatus.lastEventType !== EventType.TXN_AUTHED
    ) {
      throw new TransactionError(
        txnId,
        EventType.TXN_AUTH_CLEARED,
        `No authorized transaction found`
      );
    }
    if (time < priorTransactionStatus.initialTime) {
      throw new TransactionError(
        txnId,
        EventType.TXN_AUTH_CLEARED,
        `Transaction cleared before authorized`
      );
    }

    const availableCredit = creditService.getAvailableCreditByUserId(userId);
    creditService.updateAvailableCredit(
      userId,
      availableCredit + priorTransactionStatus.amount
    );
    console.log(`${txnId} successfully cleared`);
  }

  paymentInitiated({ txnId, userId, amount, ...args }: Transaction) {
    if (!amount || amount > 0) {
      throw new TransactionError(
        txnId,
        EventType.PAYMENT_INITIATED,
        `invalid amount`
      );
    }
    const payableBalance = creditService.getPayableBalanceByUserId(userId);
    if (payableBalance < amount) {
      throw new TransactionError(
        txnId,
        EventType.PAYMENT_INITIATED,
        `over payment detected`
      );
    }

    creditService.updatePayableBalance(userId, payableBalance + amount);

    transactionStatusService.addTransactionStatus({
      txnId,
      userId,
      amount,
      ...args,
    });

    console.log(`${txnId} successfully initiated`);
  }

  paymentPosted({ txnId, userId, time }: Transaction) {
    const priorTransactionStatus =
      transactionStatusService.getTransactionStatusByTxnId(txnId);

    if (
      !priorTransactionStatus ||
      priorTransactionStatus.lastEventType !== EventType.PAYMENT_INITIATED
    ) {
      throw new TransactionError(
        txnId,
        EventType.PAYMENT_POSTED,
        `payment posted without being initiated`
      );
    }
    if (time < priorTransactionStatus.initialTime) {
      throw new TransactionError(
        txnId,
        EventType.PAYMENT_POSTED,
        `payment posted before initiated`
      );
    }
    const availableCredit = creditService.getAvailableCreditByUserId(userId);
    creditService.updateAvailableCredit(
      userId,
      availableCredit - priorTransactionStatus.amount
    );
    console.log(`${txnId} successfully posted`);
  }

  paymentCancelled({ txnId, userId, time }: Transaction) {
    const priorTransactionStatus =
      transactionStatusService.getTransactionStatusByTxnId(txnId);

    if (
      !priorTransactionStatus ||
      priorTransactionStatus.lastEventType !== EventType.PAYMENT_INITIATED
    ) {
      throw new TransactionError(
        txnId,
        EventType.PAYMENT_CANCELED,
        `payment cancelled without being initiated`
      );
    }
    if (time < priorTransactionStatus.initialTime) {
      throw new TransactionError(
        txnId,
        EventType.PAYMENT_CANCELED,
        `payment cancelled before initiated`
      );
    }

    const payableBalance = creditService.getPayableBalanceByUserId(userId);
    creditService.updatePayableBalance(
      userId,
      payableBalance - priorTransactionStatus.amount
    );

    console.log(`${txnId} successfully cancelled`);
  }
}

const transactionService = new TransactionServiceImpl();

export default transactionService;
