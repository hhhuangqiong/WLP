var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('pages/index', {
    title: req.i18n.t('express')
  });
});

module.exports = router;
