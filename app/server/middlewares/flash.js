/**
 * To reduce the duplication of the retrieval of flash scope messages
 *
 * Requires "connect-flash" to be enabled
 *
 * @param {Object} [opts]
 *  @param {String} [opts.messagesKey='messages']
 *  @param {String} [opts.messageTypeKey='messageType']
 */
export default function (opts = {}) {
  const keys = {};
  keys.messages = opts.messagesKey || 'messages';
  keys.messageType = opts.messageTypeKey || 'messageType';

  return (req, res, next) => {
    if (req.flash) {
      res.locals.messageType = req.flash(keys.messageType)[0];
      res.locals.messages = req.flash(keys.messages);
    }

    next();
  };
}
