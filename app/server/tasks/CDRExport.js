/** @module tasks/CDRExport */

import logger from 'winston';
import _ from 'lodash';
import kue from 'kue';

/**
 * interface
 *  - constructor(queue, callback)
 *  - create(model, callback)
 */

/**
 * Create a new CDR Export
 *
 * @class CDRExport
 *
 * @see {@link: http://learnboost.github.io/kue}
 */
export class CDRExportTask {

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
   * Save the export job in the queue
   *
   * TODO
   *  - use different priority level (kue.Job.priorities), default for now
   *  - allow to configure delay, attempts and backoff
   *  - may split a separate #save() method
   *
   * @param {query} query A instance from export collection
   * @param cb the callback will recieve an err as the only param
   *
   * @return {kue.Job}
   */
  create(query, cb) {
    return this.queue.create(JOB_TYPE, query).save(cb);
  }
}

export const JOB_TYPE = 'export';
