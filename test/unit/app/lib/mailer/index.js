import assert from 'assert';

import smtpTransport from 'app/lib/mailer/transports/smtp';

// object under test
import Mailer from 'app/lib/mailer/mailer';

import TemplateMailer from 'app/lib/mailer/templateMailer';

describe('Template Mailer', function() {

  let transport = null;
  let mailer    = null;
  let tMailer   = null;

  // inline for now; externalize it better
  let opts = {
    "smtp": {
      "sender": {
        "email": "issue.tracker@maaii.com",
        "name": "M800"
      },
      "transport": {
        "host": "smtp.m800400.com",
        "port": 25,
        "tls": {
          "rejectUnauthorized": false
        }
      }
    }
  };

  beforeEach(function() {
    //console.log '__dirname', __dirname
    transport = smtpTransport(opts.smtp.transport);
    mailer    = new Mailer(transport);
    return tMailer   = new TemplateMailer(mailer, { templatesDir: __dirname });
  });

  it.skip('should send okay', function(done) {
    assert(process.env.recipient, 'Expect "recipient" to be set');

    let mailOpts = {
      from:    opts.smtp.sender.email,
      to:      process.env.recipient,
      subject: 'Testing from CoffeeScript'
    };

    return tMailer.send(mailOpts, 'test-only', {}, () => done());
  });
});
