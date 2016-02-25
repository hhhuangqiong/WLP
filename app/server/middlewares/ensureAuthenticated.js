/**
 * Assume the "passport" module has been setup correctly
 *
 * @param {String} path path to be redirected to if failed
 */
export default function ensureAuthenticated(path) {
  if (!path) throw new Error('path is required.');

  return (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      next();
      return;
    }

    res.redirect(path);
  };
}
