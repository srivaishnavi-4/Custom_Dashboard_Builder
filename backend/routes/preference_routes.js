import express from 'express'
import {get_preferences,save_preference} from '../controllers/preference_controller.js'

const router=express.Router();

router.get('/',get_preferences);
router.post('/save',save_preference)

export default router;