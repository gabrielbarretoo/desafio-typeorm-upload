import { Router } from 'express';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import { getCustomRepository } from 'typeorm';
// import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {

  const transacionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transacionsRepository.find();

  const balance = await transacionsRepository.getBalance();

  return response.json({
    transactions,
    balance
  })
});

transactionsRouter.post('/', async (request, response) => {

  const { title, value, type, category} = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category
  });



  return response.json(transaction)

});

transactionsRouter.delete('/:id', async (request, response) => {

  const { id } = request.params

  try{
    const transacionsRepository = getCustomRepository(TransactionsRepository);
    await transacionsRepository.delete({ id: id})
    return response.send(200)
  } catch (err) {
    return response.send(400)
  }
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {

  const importTransactionsService = new ImportTransactionsService();

  const transactions = await importTransactionsService.execute(request.file.filename);

  return response.json(transactions)

});

export default transactionsRouter;
