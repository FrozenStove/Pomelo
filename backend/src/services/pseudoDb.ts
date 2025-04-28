import { Transaction } from "../models/transactionModel";
import { EventType } from "../models/transactionModel";
import { TransactionStatus, Status } from "../models/transactionStatusModel";
import { User } from "../models/userModel";

export const testTransactionStatuses: TransactionStatus[] = [
  {
    id: "1",
    userId: 123,
    amount: 200,
    lastEventType: EventType.TXN_SETTLED,
    status: Status.SETTLED,
    initialTime: 1,
    finalTime: 2,
  },
  {
    id: "2",
    userId: 789,
    amount: 300,
    lastEventType: EventType.TXN_SETTLED,
    status: Status.SETTLED,
    initialTime: 2,
    finalTime: 3,
  },
];

export const testCreditLimits: User[] = [
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

export const testTransactions: Transaction[] = [
  {
    id: 1,
    txnId: "1",
    amount: 100,
    userId: 123,
    type: EventType.TXN_AUTHED,
    time: 1,
  },
  {
    id: 2,
    txnId: "1",
    amount: 200,
    userId: 123,
    type: EventType.TXN_SETTLED,
    time: 2,
  },
  {
    id: 3,
    txnId: "2",
    amount: 300,
    userId: 789,
    type: EventType.TXN_AUTHED,
    time: 2,
  },
  {
    id: 4,
    txnId: "2",
    amount: 300,
    userId: 789,
    type: EventType.TXN_SETTLED,
    time: 3,
  },
];
