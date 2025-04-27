import { EventType } from "../models/TransactionModel";

export class TransactionError extends Error {
  public readonly txnId: string;
  public readonly eventType: EventType;

  constructor(txnId: string, eventType: EventType, message: string) {
    super(message);
    this.name = "TransactionError";
    this.txnId = txnId;
    this.eventType = eventType;

    Object.setPrototypeOf(this, TransactionError.prototype);
  }
}
