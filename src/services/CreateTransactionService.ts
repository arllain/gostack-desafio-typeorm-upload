import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  private categoriesRepository = getRepository(Category);

  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!(type === 'income' || type === 'outcome')) {
      throw new AppError('Invalid type of transaction');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && value > total) {
      throw new AppError(
        'You don’t have enough funds in this account for this transaction',
      );
    }

    let categoryExists = await this.categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      categoryExists = this.categoriesRepository.create({
        title: category,
      });

      await this.categoriesRepository.save(categoryExists);
    }

    delete categoryExists.created_at;
    delete categoryExists.updated_at;
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryExists,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
