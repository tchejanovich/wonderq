import { Router } from 'express';
import { middleware as query } from 'querymen';
import { create, index, update } from './controller';

const router = new Router();

router.get('/', query(), index);
router.post('/', create);
router.put('/:id', update);

export default router;
