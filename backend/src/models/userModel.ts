import { Transaction } from "./TransactionModel";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  creditLimit: number;
  payableBalance: number;
  transactions: Transaction[];
};
