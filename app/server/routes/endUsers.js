import { Router } from 'express';

var router = Router();

router.get('/view/header', function(req, res, next) {
  res.render('pages/endUsers/header');
});

router.get('/view/body', function(req, res, next) {
  res.render('pages/endUsers/body');
});

router.get('/view/enduser', function(req, res, next) {
  res.render('pages/endUsers/enduser');
});

export default router;
