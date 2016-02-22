import { Router } from 'express';
import * as images from '../routes/images';

const router = Router();
router.get('/:imageId', images.getImage);

export default router;
