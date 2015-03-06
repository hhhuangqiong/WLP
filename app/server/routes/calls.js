import { Router } from 'express';

var router = Router();

router.get('/view/header', function(req, res, next) {
  res.render('pages/calls/header');
});

router.get('/view/body', function(req, res, next) {
  res.render('pages/calls/body');
});

export default router;
