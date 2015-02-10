import nconf                from 'nconf';
import { fetchContainer }   from 'app/server/initializers/ioc';
import { Router }           from 'express';

var ensureAuthenticated = fetchContainer(nconf.get('containerName'), 'middlewares.ensureAuthenticated');
var router              = Router();

// Entry point for angularJS app
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('layout/admin-layout', {});
});

export default router;
