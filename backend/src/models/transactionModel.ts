import { CreditTransactionSummary } from "./userModel";

export enum EventType {
  TXN_AUTHED = "TXN_AUTHED",
  TXN_SETTLED = "TXN_SETTLED",
  TXN_AUTH_CLEARED = "TXN_AUTH_CLEARED",
  PAYMENT_INITIATED = "PAYMENT_INITIATED",
  PAYMENT_POSTED = "PAYMENT_POSTED",
  PAYMENT_CANCELED = "PAYMENT_CANCELED",
}

export type Transaction = {
  // unique id for the transaction
  id: number;
  // non-unique id for the transaction
  txnId: string;
  userId: number;
  amount?: number;
  type: EventType;
  time: number;
};
// finalTime?: number;

export type TransactionInput = {
  eventTime: number;
  txnId: string;
  amount?: number;
};

export interface CreditEvent extends TransactionInput {
  eventType: EventType;
}

export type SummaryInput = {
  creditLimit: number;
  events: CreditEvent[];
};

export type CreditSummary = {
  availableCredit: number;
  payableBalance: number;
  pendingTransactions: CreditTransactionSummary[];
  settledTransactions: CreditTransactionSummary[];
};

export type TransactionHistory = Omit<CreditEvent, "txnId">;
