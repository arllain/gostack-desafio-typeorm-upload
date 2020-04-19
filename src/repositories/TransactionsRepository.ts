import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const balance = transactions.reduce(
      (accumulator, transaction) => {
        if (transaction.type === 'income') {
          accumulator.income += transaction.value;
        }
        if (transaction.type === 'outcome') {
          accumulator.outcome += transaction.value;
        }
        accumulator.total = accumulator.income - accumulator.outcome;
        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }

  public async all(): Promise<Transaction[]> {
    // const transactions = await this.find({ relations: ['category'] });
    const transactions = await this.find({
      select: ['id', 'title', 'type', 'value'],
      relations: ['category'],
    });

    // "category": {
    //   "id": "5f918faf-7468-4d6c-9fc7-203642a4ed22",
    //   "title": "Salary",
    //   "created_at": "2020-04-19T12:54:14.451Z",
    //   "updated_at": "2020-04-19T12:54:14.451Z"
    // }
    return transactions;
  }
}

export default TransactionsRepository;
