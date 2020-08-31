import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import { getCustomRepository, getRepository } from 'typeorm'
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request{
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({ title, value, type, category}: Request): Promise<Transaction> {

    const categoryRepository = getRepository(Category);

    const checkCategoryExists = await categoryRepository.findOne({
      where: { title: category }
    });

    var category_id = checkCategoryExists?.id

    if(!checkCategoryExists) {
      const newCategory =  categoryRepository.create({
        title: category
      })

      await categoryRepository.save(newCategory);

      category_id = newCategory.id;

    }

    const transactionsRepository = getCustomRepository(TransactionsRepository)

    const balance = await transactionsRepository.getBalance();
    console.log(value)
    console.log(balance.total)

    if(type === 'outcome' && value > balance.total){
      throw new AppError('Not balance enough', 400)
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id,
    })

    await transactionsRepository.save(transaction);

    return transaction
  }
}

export default CreateTransactionService;
