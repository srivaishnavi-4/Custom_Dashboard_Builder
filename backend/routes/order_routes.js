import express from 'express';
import { create_order, get_order, update_order, delete_order } from '../controllers/order_controller.js';

const router = express.Router();

router.route('/').post(create_order).get(get_order);
router.route('/:id').put(update_order).delete(delete_order);

export default router;