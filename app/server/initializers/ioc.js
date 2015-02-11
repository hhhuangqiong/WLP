import Bottle from 'bottlejs';
import path from 'path';

export default function(nconf) {
  var ioc = new Bottle();

  // NB: relative to 'node_modules/'
  ioc.constant('MAIL_TMPL_DIR', path.resolve(__dirname, '../../../../mail/templates'));
  ioc.constant('MAIL_TMPL_CONFIG', { templatesDir: ioc.container.MAIL_TMPL_DIR });
  ioc.constant('SMTP_CONFIG',   nconf.get('smtp:transport'));

  ioc.factory('SmtpTransport', container => {
    var transport = require('app/lib/mailer/transports/smtp');
    return transport(ioc.container.SMTP_CONFIG);
  });

  ioc.service('Mailer', require('app/lib/mailer/mailer'), 'SmtpTransport');
  ioc.service('TemplateMailer', require('app/lib/mailer/templateMailer'), 'Mailer', 'MAIL_TMPL_CONFIG');

  return ioc;
}
