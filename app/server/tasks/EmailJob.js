/** @module tasks/emailJob */

import _ from 'lodash';
import kue from 'kue';

/**
 * interface
 *  - constructor(queue, callback)
 *  - create(model, callback)
 */

/**
 * Create a new email job
 *
 * @class EmailJob
 *
 * @see {@link: http://learnboost.github.io/kue}
 */
export class EmailJob {

  /**
   * @param {Queue} queue Job queue
   * @param {function} processFn will receive 2 arguments: job & done
   *
   * @see {@link: https://github.com/LearnBoost/kue#processing-jobs}
   */
  constructor(queue, processFn) {
    if (!queue) throw new Error('require a Queue object');
    if (!_.isFunction(processFn)) throw new Error('A function for how to process the job is required');

    this.queue = queue;

    // any scenario to unbind
    this.queue.process(JOB_TYPE, processFn);
  }

  /**
   * Save the email job in the queue
   *
   * TODO
   *  - use different priority level (kue.Job.priorities), default for now
   *  - allow to configure delay, attempts and backoff
   *  - may split a separate #save() method
   *
   * @param {Email} email A instance from email collection
   * @param cb the callback will recieve an err as the only param
   *
   * @return {kue.Job}
   */
  create(email, cb) {
    //TODO any validation on the email object
    return this.queue.create(JOB_TYPE, {
      // TODO 'title' property, same as subject + username
      mailOpts: email.get('meta'),
      templateName: email.templateName(),
      templateData: email.templateData()
    }).save(cb);
  }
}

export const JOB_TYPE = 'emails';
