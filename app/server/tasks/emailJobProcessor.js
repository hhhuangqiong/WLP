/** @module tasks/emailJobProcessor */

import logger from 'winston';
import _ from 'lodash';

/**
 * Prepare a process function to be used with Jobs#process
 *
 * @see {@link https://github.com/LearnBoost/kue#processing-jobs}
 *
 * @param {object} mailer
 */
export default function processFn(mailer) {
  if (!mailer) throw new Error('mailer is required');

  // MAYBE define an interface for mailer implementation
  if (!_.isFunction(mailer.send)) throw new Error('mailer should have #send method');

  return function(job, done) {
    logger.debug('Email job details %j', job, {});
    const data = job.data;

    // MAYBE stronger data structure protocol between job & processor
    const mailOpts     = data.mailOpts;
    const templateName = data.templateName;
    const templateData = data.templateData;

    mailer.send(mailOpts, templateName, templateData, done);
  };
}
