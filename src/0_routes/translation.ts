import express from 'express';
import * as translationController from '../1_controllers/translation';

const router = express.Router();

router.post('/translate', translationController.translate);
router.get('/supported-languages', translationController.getSupportedLanguages);

export default router;
