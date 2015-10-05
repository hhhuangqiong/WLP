import { Router } from 'express';
import * as images from '../routes/images';

let router = Router();
router.get('/:imageId', images.getImage);

export default router;
