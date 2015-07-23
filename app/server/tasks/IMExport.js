import _ from 'lodash';
import csv from 'fast-csv';
import moment from 'moment';
import fs from 'fs';
import nconf from 'nconf';
import kue from 'kue';
import logger from 'winston';
import os from 'os';
import Q from 'q';
import path from 'path';

import { fetchDep } from '../utils/bottle';
import {IM_EXPORT} from '../../config';

import { getCountryName, beautifyTime, stringifyNumbers, sanitizeNull } from '../utils/StringFormatter';

export const JOB_TYPE = 'exportTDR';

let validateCompletedTime = (completedTime) => {
  let nowTimestamp = moment().format('x');
  let difference = nowTimestamp - completedTime;
  return (moment.duration(difference).asHours() >= 4);
}

/***
 * @constructor IMExport
 * @param {Kue} kueue instance of job queue
 * @param  {object}   param - may contain following
 * @param  {string}   param.carrierId - specific identity from a client account
 * @param  {string}   param.from - timestamp in millisecond
 * @param  {string}   param.to - timestamp in millisecond
 * @param  {number}   param.page - specify starting page, always 0
 * @param  {number}   param.size - specify no. records on each page, always 1000
 * @param  {string}   [param.origin] - specify 2 letter country code for origin, value is referenced in /app/data/countries.json using 'alpha2' code
 * @param  {string}   [param.destination] - specify 2 letter country code for origin, value is referenced in /app/data/countries.json using 'alpha2' code
     in /app/lib
 */

function humanizeFields(row){
  /* jscs:disable */
  row.device_id = stringifyNumbers(row.device_id);
  /* jscs: enable */

  row.origin = getCountryName(row.origin);
  row.destination = getCountryName(row.destination);
  row.timestamp = beautifyTime(row.timestamp);

  return sanitizeNull(row);
}

export default class ImExportTask {
  constructor(kueue, param) {
    let deferred = Q.defer();
    this.kueue = kueue;
    this.job = deferred.promise;

    let job = this.kueue.create(JOB_TYPE, param).save((err) => {
      if (err) {
        logger.error(`Unable to create ${JOB_TYPE} job`, err);
        deferred.reject(err);
      }
      else {
        logger.info(`Created ${JOB_TYPE} job successfully. ${job.id}`);
        deferred.resolve(job);
      }
    });

    job.on('complete', function(param) {
      logger.info('Job completed with data ', param);

    }).on('failed attempt', function(errorMessage, doneAttempts) {
      logger.error('Job failed. Attempt %s', doneAttempts, errorMessage);

    }).on('failed', function(errorMessage) {
      logger.error('Job failed', errorMessage);

    }).on('progress', function(progress, data) {
      logger.info('\r  job #%s %s% complete with %s ', job.id, progress, data);
    });
  }

  /**
   * Create a TDR export job.
   * @returns {Promise<Kue.Job>} Kue job instance
   */
  ready() {
    return this.job;
  }

  /**
   * Starts job process
   * @returns {Kue.Job} Kue job instance
   *
   * @param  {Function, cb - pass in by kue, reference https://github.com/Automattic/kue#processing-jobs
   */
  start() {
    this.kueue.process(JOB_TYPE, (job, done) => {
      Q.ninvoke(this, 'exportCSV', job)
        .then(function(file) {
          return done(null, { file });
        })
        .catch(function(err) {
          /**
           * Gracefully handle errors to prevent from stuck jobs:
           * https://github.com/Automattic/kue#prevent-from-stuck-active-jobs
           */
          return done(err);
        })
        .done();
    });
  }

  //job process function
  exportCSV(job, cb) {
    let param = job.data;

    let csvStream = csv.createWriteStream({headers: true});
    /* jscs: disable */
    let writableStream = fs.createWriteStream(path.join(os.tmpdir(), job.created_at + '-' + job.id + '.csv'));
    /* jscs: enable */
    writableStream.on('finish', function() {
      csvStream.end();
      logger.info('Writing file finished.');
    });
    csvStream.pipe(writableStream);

    /**
     * fetch and write to file a single request as csv format.
     * @param  {object}   param - may contain following
     * @param  {string}   param.carrierId - specific identity from a client account
     * @param  {string}   param.startDate - timestamp in millisecond
     * @param  {string}   param.endDate - timestamp in millisecond
     * @param  {number}   param.page - specify starting page, always 0
     * @param  {number}   param.size - specify no. records on each page, always 1000
     * @param  {string}   [param.type] - specify call type, either 'ONNET' or 'OFFNET', other string will cause api to fail
     * @param  {string}   [param.caller_country] - specify caller's located country, value is referenced in /app/data/countries.json using 'alpha2' code
     in /app/lib
     */
    let next = (param) => {
      let request = fetchDep(nconf.get('containerName'), 'ImRequest');

      request.getImStat(param, (err, result) => {
        if (err) return cb(err, null);

        let totalElements = result.contents.length;
        let totalPages = result.totalPages;
        let pageSize = result.pageSize;
        let pageNumber = result.pageNumber;
        let offset = result.offset;

        while (offset < totalElements) {
          let row = _.pick(result.contents[offset], IM_EXPORT.DATA_FIELDS);

          row = humanizeFields(row);

          csvStream.write(row);
          offset++;
          job.progress(offset, totalElements, {nextRow: offset === totalElements ? 'Job completed.' : offset });
        }

        if (offset === totalElements) {
          // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
          job.data.file = path.join(os.tmpdir(), job.created_at + '-' + job.id + '.csv');
          return cb(null, job.data.file);
          /* jscs: enable */
        }

        // for next page to export
        if (offset < totalElements) {
          param.request = requestName;
          param.page = +pageNumber + 1;
          next(param);
        }
      });
    }

    next(param);
  }
}
