/**
 * Created by ksh on 1/12/15.
 */
var logger = require('winston');
class PermissionChecker {

  //Check for permission
  static check(req:any, res:any, next:Function) {
    logger.info("Checking permissions for " + req.user.username);
    next();
  }

}
export =PermissionChecker;
