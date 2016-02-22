import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';

/**
 * All options are passed through to the SMTP transporter
 *
 * @module mailer/transports
 * @func
 * @param {Object} opts
 *
 * @see {@link https://github.com/andris9/nodemailer-smtp-transport#usage}
 */
export default function(opts = {}) {
  return nodemailer.createTransport(smtpTransport(opts));
}
