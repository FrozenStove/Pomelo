"use strict";

import { WriteStream, createWriteStream } from "fs";
process.stdin.resume();
process.stdin.setEncoding("utf-8");

let inputString: string = "";
let inputLines: string[] = [];
let currentLine: number = 0;

process.stdin.on("data", function (inputStdin: string): void {
  inputString += inputStdin;
});

process.stdin.on("end", function (): void {
  inputLines = inputString.split("\n");
  inputString = "";

  main();
});

function readLine(): string {
  return inputLines[currentLine++];
}

/*
 * Complete the 'summarize' function below.
 *
 * The function is expected to return a STRING.
 * The function accepts STRING inputJSON as parameter.
 */

const inputJSON = `{
"creditLimit": 1000,
  "events": [
    {
      "eventType": "TXN_AUTHED",
      "eventTime": 1,
      "txnId": "t1",
      "amount": 123
    }
  ]
}`;

enum EventType {
  TXN_AUTHED = "TXN_AUTHED",
  TXN_SETTLED = "TXN_SETTLED",
  TXN_AUTH_CLEARED = "TXN_AUTH_CLEARED",
  PAYMENT_INITIATED = "PAYMENT_INITIATED",
  PAYMENT_POSTED = "PAYMENT_POSTED",
  PAYMENT_CANCELED = "PAYMENT_CANCELED",
}

type Transaction = {
  id: string;
  amount: number;
  initialTime: number;
  finalTime?: number;
};

type TransactionInput = {
  eventTime: number;
  txnId: string;
  amount?: number;
};

interface CreditEvent extends TransactionInput {
  eventType: EventType;
}

type SummaryInput = {
  creditLimit: number;
  events: CreditEvent[];
};

type CreditSummary = {
  availableCredit: number;
  payableBalance: number;
  pendingTransactions: Transaction[];
  settledTransactions: Transaction[];
};

type TransactionHistory = Omit<CreditEvent, "txnId">;

class TransactionError extends Error {
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

class CreditCardSummarizer {
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

function summarizeCreditEvents(input: SummaryInput): CreditSummary {
  const cardSummary = new CreditCardSummarizer({
    creditLimit: input.creditLimit,
  });
  input.events.forEach((event) => {
    console.log(
      `Processing ${event.eventType} with transaction id=${event.txnId}`,
      event
    );
    switch (event.eventType) {
      case EventType.TXN_AUTHED:
        cardSummary.txnAuthed(event);
        break;
      case EventType.TXN_SETTLED:
        cardSummary.txnSettled(event);
        break;
      case EventType.TXN_AUTH_CLEARED:
        cardSummary.txnCleared(event);
        break;
      case EventType.PAYMENT_INITIATED:
        cardSummary.paymentInitiated(event);
        break;
      case EventType.PAYMENT_POSTED:
        cardSummary.paymentPosted(event);
        break;
      case EventType.PAYMENT_CANCELED:
        cardSummary.paymentCancelled(event);
        break;
    }
  });

  return cardSummary.summarize();
}

function generateSummaryString(input: CreditSummary): string {
  const creditAndBalance = `Available credit: $${input.availableCredit}\nPayable balance: $${input.payableBalance}`;
  let pendingTransactions = `Pending transactions:\n`;
  let settledTransactions = `Settled transactions:\n`;

  input.pendingTransactions.forEach((pTxn) => {
    pendingTransactions += `${pTxn.id}: ${formatDollars(pTxn.amount)} @ time ${
      pTxn.initialTime
    }\n`;
  });

  input.settledTransactions.forEach((sTxn) => {
    settledTransactions += `${sTxn.id}: ${formatDollars(sTxn.amount)} @ time ${
      sTxn.initialTime
    } (finalized @ time ${sTxn.finalTime})\n`;
  });

  return (
    creditAndBalance +
    "\n\n" +
    pendingTransactions +
    "\n" +
    settledTransactions
  ).trim();
}

function formatDollars(num: number): string {
  if (num < 0) {
    return `-$${Math.abs(num)}`;
  } else {
    return `$${num}`;
  }
}

function summarize(inputJSON: string): string {
  // ensure input validation occurs
  // prompt indicates that events will come in chronological order, add this verification later

  // we keep the JSON input form of the function seperate since this is typically used in event handlers or http requests. We can keep the object based function for internal use.
  const input = JSON.parse(inputJSON);

  const creditSummary = summarizeCreditEvents(input);

  return generateSummaryString(creditSummary);
}

function main() {
  const ws: WriteStream = createWriteStream(process.env["OUTPUT_PATH"]);

  const inputJSON: string = readLine();

  const result: string = summarize(inputJSON);

  ws.write(result + "\n");

  ws.end();
}
