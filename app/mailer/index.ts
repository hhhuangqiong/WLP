var nodemailer = require('nodemailer');
var emailTemplates = require('email-templates');
var path = require('path');
var logger = require('winston');
var nconf = require('nconf');
var _ = require('underscore');

interface mailerConfig{
  templatesDir: string;
  transport: any;
}

interface mailOptions{
    from: string;
    to: string;
    subject: string;
    text: string;
}

export class Mailer{
  config: any;
  templatesDir: string;
  transportConfig: any;
  transport: any;
  constructor(config: mailerConfig) {
    this.templatesDir = config.templatesDir || path.join(__dirname, 'templates');
    this.transportConfig = config.transport || nconf.get('smtp:transport');
    this.transport = nodemailer.createTransport(this.transportConfig);
    // Content
  }

  private sendMail(mailOptions: mailOptions, cb:Function){
    if(!mailOptions.to){
       return cb(new Error('Lack of mail receiver'));
    }
    this.transport.sendMail(mailOptions, function(error, info){
      if(error) return cb(error);
      else return cb(null, info.response);
    })
  }

  private getContext(tmplName: string, tmplData: string, cb:Function){
    emailTemplates(this.templatesDir, function(err, template){
      if (err) {
        logger.error('Error lookup templates directory, %s', this.templatesDir, err.stack);
        return cb(err);
      }
      template(tmplName, tmplData, function(err, html, text) {
        if(err) {
          logger.error('Error prepare template %s with %j', tmplName, tmplData, err.stack);
          return cb(err);
        }
        cb(null, html, text);
      });
    });
  }

  mail(mailOptions: mailOptions, tmplName: string, tmplData: any, cb: Function){
    this.getContext(tmplName, tmplData, (error:any, html:string, text:string) => {
      if(error){
        logger.error(error);
        cb(error);
      }
      else{
        mailOptions = _.extend(mailOptions, {
          html: html
        });
        this.sendMail(mailOptions, cb);
      }
    });
  }
}
