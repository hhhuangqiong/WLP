var emailTemplates = require('email-templates');
var fs             = require('fs');
var logger         = require('winston');

var TemplateMailer = module.exports = function(mailer, opts) {
  if (!mailer)
    throw new Error('mailer is required');
  this.mailer = mailer;
  this._templatesDir = opts.templatesDir;
  if (!fs.existsSync(this._templatesDir))
    throw new Error('templatesDir "' + this._templatesDir + '" doesn\'t not exist');
};
/**
 * Send email using the data with the template specified
 *
 * @param {Object}
 * @param {String}
 * @param {Object}
 * @param {Function} cb
 */
TemplateMailer.prototype.send = function(mailOpts, tmplName, tmplData, cb) {
  //TODO validate mailOpts
  if (!mailOpts || !tmplName || !tmplData)
    throw new Error('Invalid number of arguments');
  this._tmplContent(tmplName, tmplData, function(err, html) {
    if (err)
      return cb(err);
    mailOpts.html = html;

    // TODO change it to make use of mailer
    this.mailer.sendHtmlContent(mailOpts, html, function(err, responseStatus) {
      if (err)
        return cb(err);
      logger.info('Sending email using template %s with %j', tmplName, tmplData, {});
      cb(null, responseStatus.message);
    });
  }.bind(this));
};
/**
 * Prepare the message content with the specified template & data
 *
 * @private
 * @param {String} tmplName
 * @param {Object} tmplData
 * @param {Function} cb
 */
TemplateMailer.prototype._tmplContent = function(tmplName, tmplData, cb) {
  emailTemplates(this._templatesDir, function(err, template) {
    if (err) {
      logger.error('Error lookup templates directory, %s', this._templatesDir, err.stack);
      return cb(err);
    }

    template(tmplName, tmplData, function(err, html, text) {
      if (err) {
        logger.error('Error prepare template %s with %j', tmplName, tmplData, err.stack, {});
        return cb(err);
      }

      cb(null, html, text);
    });
  });
};
