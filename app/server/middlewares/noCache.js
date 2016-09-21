// Express middleware to set Cache-Control on responses,
//   currently used on all web server api endpoints
export default function noCache(req, res, next) {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', 0);
  next();
}
