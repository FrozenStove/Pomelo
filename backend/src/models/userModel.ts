import { Transaction } from "./TransactionModel";

export type User = {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  creditLimit: number;
  availableCredit: number;
  payableBalance: number;
};
