/**
 * Assume the "passport" module has been setup correctly
 *
 * @param {String} path
 */
export default function ensureAuthenticated(path) {
  if (!path) throw new Error('path is required.');

  return (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    res.redirect(path);
  }
}
