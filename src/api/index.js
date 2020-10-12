import { Router } from 'express';
import messages from './messages';

const router = new Router();

router.use('/messages', messages);

export default router;
