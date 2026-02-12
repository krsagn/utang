import { Router } from 'express';
// Controller function imports
import {
  getDebts,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
} from '../controllers/debtController.js';
import { requireAuth } from '../middleware/auth.js';

const debtRouter = Router();

// Guard entire router
debtRouter.use(requireAuth);

// Route definitions
debtRouter.get('/', getDebts);
debtRouter.post('/', createDebt);
debtRouter.patch('/:id', updateDebt);
debtRouter.delete('/:id', deleteDebt);
debtRouter.get('/:id', getDebtById);

export default debtRouter;
