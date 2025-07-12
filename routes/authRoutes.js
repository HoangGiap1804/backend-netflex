import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import auth from '../middleware/authMiddleware.js'

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/profile', auth, authController.getProfile);

export default router;

