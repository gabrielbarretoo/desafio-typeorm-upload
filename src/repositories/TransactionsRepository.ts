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
    const allTransactions = await this.find();
    var income = 0;
    var outcome = 0;
    var total = 0;
    if(allTransactions){
      for(var i = 0 ; i < allTransactions.length ; i++) {
        var value = eval(allTransactions[i].value.toString())
        if(allTransactions[i].type === 'income') {
          income = income + value;
        }
        if(allTransactions[i].type === 'outcome') {
          outcome = outcome + value;
        }
      }
      total = income - outcome;
    }
    return { income, outcome, total }
  }

}

export default TransactionsRepository;
