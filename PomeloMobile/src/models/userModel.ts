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

export type CreditTransactionSummary = {
  id: string;
  amount: number;
  initialTime: number;
  finalTime?: number;
};
