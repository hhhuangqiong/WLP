import { ERROR_500 } from '../paths';

/**
 * Default error handler
 */
export default function(err, req, res) {
  // in case there is a MongoError on testbed or production
  // crash the node application and let docker restarts it
  if (err.name === 'MongoError' && process.env.NODE_ENV !== 'development') {
    process.exit(1);
  }

  return res.redirect(ERROR_500);
}

