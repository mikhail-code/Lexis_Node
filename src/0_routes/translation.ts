import express from 'express';
import * as translationController from '../1_controllers/translation';

const router = express.Router();

router.post('/translate', translationController.translate);


export default router;
