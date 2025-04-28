export enum Status {
  PENDING = "pending",
  SETTLED = "settled",
  CANCELLED = "cancelled",
}

export type TransactionStatus = {
  id: string;
  userId: number;
  amount: number;
  lastEventType: string;
  status: Status;
  initialTime: number;
  finalTime?: number;
};
