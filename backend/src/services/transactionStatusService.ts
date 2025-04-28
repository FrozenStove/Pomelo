import { EventType, Transaction } from "../models/transactionModel";
import { TransactionStatus, Status } from "../models/transactionStatusModel";
import { testTransactionStatuses } from "./pseudoDb";

type TransactionStatusService = {
  getTransactionStatusByUserId: (userId: number) => TransactionStatus[];
  getTransactionStatusByTxnId: (txnId: string) => TransactionStatus | undefined;
  updateTransactionStatus: (transaction: Transaction) => void;
};

class TransactionStatusServiceImpl implements TransactionStatusService {
  getTransactionStatusByUserId(userId: number): TransactionStatus[] {
    return testTransactionStatuses.filter((t) => t.userId === userId);
  }

  getTransactionStatusByTxnId(txnId: string): TransactionStatus | undefined {
    return testTransactionStatuses.find((t) => t.id === txnId);
  }

  addTransactionStatus(transaction: Transaction): void {
    const newStatus: TransactionStatus = {
      id: transaction.txnId,
      userId: transaction.userId,
      amount: transaction.amount ?? 0,
      lastEventType: transaction.type,
      status: Status.PENDING,
      initialTime: transaction.time,
    };
    testTransactionStatuses.push(newStatus);
  }

  updateTransactionStatus(transaction: Transaction): void {
    const existingStatus = this.getTransactionStatusByTxnId(transaction.txnId);

    if (existingStatus) {
      switch (transaction.type) {
        case EventType.TXN_AUTHED:
          existingStatus.status = Status.PENDING;
          if (transaction.amount !== undefined) {
            existingStatus.amount = transaction.amount;
          }
          existingStatus.lastEventType = EventType.TXN_AUTHED;
          break;
        case EventType.TXN_SETTLED:
          existingStatus.status = Status.SETTLED;
          if (transaction.amount !== undefined) {
            existingStatus.amount = transaction.amount;
          }
          existingStatus.lastEventType = EventType.TXN_SETTLED;
          existingStatus.finalTime = transaction.time;
          break;
        case EventType.TXN_AUTH_CLEARED:
          existingStatus.status = Status.CANCELLED;
          existingStatus.lastEventType = EventType.TXN_AUTH_CLEARED;
          existingStatus.finalTime = transaction.time;
          break;
      }
    } else {
      const newStatus: TransactionStatus = {
        id: transaction.txnId,
        userId: transaction.userId,
        amount: transaction.amount ?? 0,
        lastEventType: transaction.type,
        status:
          transaction.type === EventType.TXN_AUTHED
            ? Status.PENDING
            : transaction.type === EventType.TXN_SETTLED
            ? Status.SETTLED
            : Status.CANCELLED,
        initialTime: transaction.time,
      };
      testTransactionStatuses.push(newStatus);
    }
  }
}

const transactionStatusService = new TransactionStatusServiceImpl();
export default transactionStatusService;
