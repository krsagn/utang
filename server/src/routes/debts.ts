import { Router } from 'express';
// Controller function imports
import {
  getDebts,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
} from '../controllers/debtController.js';

const router = Router();

// Route definitions
router.get('/', getDebts);
router.post('/', createDebt);
router.patch('/:id', updateDebt);
router.delete('/:id', deleteDebt);
router.get('/:id', getDebtById);

export default router;
