var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
/**
 * All options are passed through to the SMTP transporter
 *
 * https://github.com/andris9/nodemailer-smtp-transport#usage
 * @param {Object} opts
 */
module.exports = function (opts) {
    opts = opts || {};
    return nodemailer.createTransport(smtpTransport(opts));
};
