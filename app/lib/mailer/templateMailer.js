import emailTemplates from 'email-templates';
import fs from 'fs';
import logger from 'winston';

const TemplateMailer = module.exports = function constructor(mailer, opts) {
  if (!mailer) throw new Error('mailer is required');
  this.mailer = mailer;
  this._templatesDir = opts.templatesDir;

  if (!fs.existsSync(this._templatesDir)) {
    throw new Error(`templatesDir ${this._templatesDir} doesn\'t not exist`);
  }
};
/**
 * Send email using the data with the template specified
 *
 * @param {Object}
 * @param {String}
 * @param {Object}
 * @param {Function} cb
 */
TemplateMailer.prototype.send = function send(mailOpts, tmplName, tmplData, cb) {
  // TODO validate mailOpts
  if (!mailOpts || !tmplName || !tmplData) {
    throw new Error('Invalid number of arguments');
  }

  this._tmplContent(tmplName, tmplData, function _tmplContent(err, html) {
    if (err) {
      cb(err);
      return;
    }

    mailOpts.html = html;

    // TODO change it to make use of mailer
    this.mailer.sendHtmlContent(mailOpts, html, (sendErr, responseStatus) => {
      if (sendErr) {
        cb(sendErr);
        return;
      }

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
TemplateMailer.prototype._tmplContent = function _tmplContent(tmplName, tmplData, cb) {
  emailTemplates(this._templatesDir, function getEmailTemplates(err, template) {
    if (err) {
      logger.error('Error lookup templates directory, %s', this._templatesDir, err.stack);
      cb(err);
      return;
    }

    template(tmplName, tmplData, (templateErr, html, text) => {
      if (templateErr) {
        logger.error('Error prepare template %s with %j', tmplName, tmplData, templateErr.stack, {});
        cb(templateErr);
        return;
      }

      cb(null, html, text);
    });
  });
};
