import express from 'express';
import { get_dashboard_metrics } from '../controllers/chart_controller.js';

const router = express.Router();

router.get('/', get_dashboard_metrics);

export default router;