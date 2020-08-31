import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';


class ImportTransactionsService {


  async execute(csvFilename: string): Promise<Transaction[]> {

    async function loadCSV(filePath: string): Promise<any[]> {
      const readCSVStream = fs.createReadStream(filePath);

      const parseStream = csvParse({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });

      const parseCSV = readCSVStream.pipe(parseStream);

      const lines: any[] | PromiseLike<any[]> = [];

      parseCSV.on('data', line => {
        lines.push(line);
      });

      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });

      return lines;
    }

    const csvFilePath = path.resolve(uploadConfig.directory, csvFilename);

    const data = await loadCSV(csvFilePath)

    const transactionsFromCsv = [];

    for(var i = 0; i < data.length; i++){

      var line = data[i];

      transactionsFromCsv.push({
        title: line[0].toString(),
        type: line[1],
        value: parseInt(line[2]),
        category: line[3],
      })
    }

    const createTransaction = new CreateTransactionService();

    const transactions = []

    for(var i= 0 ; i < transactionsFromCsv.length ; i++){
      const transaction = await createTransaction.execute({
        title: transactionsFromCsv[i].title,
        value: transactionsFromCsv[i].value,
        type: transactionsFromCsv[i].type,
        category: transactionsFromCsv[i].category
      });

      transactions.push(transaction)
    }



    return transactions

  }
}

export default ImportTransactionsService;
