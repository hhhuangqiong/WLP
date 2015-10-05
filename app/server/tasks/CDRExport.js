import _ from 'lodash';
import csv from 'fast-csv';
import nconf from 'nconf';
import kue from 'kue';
import logger from 'winston';
import Q from 'q';
import redisWStream from 'redis-wstream';

import { fetchDep } from '../utils/bottle';
import { CDR_EXPORT } from '../../config';
import { getCountryName, beautifyTime, parseDuration, sanitizeNull } from '../utils/StringFormatter';

const JOB_TYPE = 'exportCdr';

/**
 * make export field to be readable by human in csv format file.
 * @param  {object}   param - may contain following
 * @param  {string}   param.callee - stringify to avoid incorrect format parsing using Excel
 * @param  {integer}   param.duration - to show meaningful time in hour/minute/second approach
 * @param  {date}   param.start_time - to show meaningful date time  format
 * @param  {date}   param.end_time - to show meaningful date time  format
 * @param  {date}   param.answer_time - to show meaningful date time  format
 * @param  {string}   param.caller_country - to be country name instead of country code
 * @param  {string}   param.callee_country - to be country name instead of country code
 */
function humanizeFields(row){
  row.callee = "'" + row.callee + "'";
  row.duration = parseDuration(row.duration);

  /* jscs: disable */
  row.start_time = beautifyTime(row.start_time);
  row.end_time = beautifyTime(row.end_time);
  row.answer_time = beautifyTime(row.answer_time);
  row.caller_country = getCountryName(row.caller_country);
  row.callee_country = getCountryName(row.callee_country);
  /* jscs: enable */

  return sanitizeNull(row);
}

/***
 * @constructor CDRExport
 * @param {Kue} kueue instance of job queue
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
export default class CDRExport {
  constructor(kueue, param) {
    this.kueue = kueue;
    this.exportParam = param;

    let deferred = Q.defer();

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
   * Create a CDR export job.
   * @returns {Promise<Kue.Job>} Kue job instance
   */
  ready() {
    return this.job;
  }

  /**
   * Starts job process
   * @param  {Function} done - pass in by kue, reference https://github.com/Automattic/kue#processing-jobs
   * @returns {Kue.Job} Kue job instance
   */
  start() {
    this.kueue.process(JOB_TYPE, (job, done) => {
      Q.ninvoke(this, 'exportCSV', job)
        .then(() => {
          return done(null);
        })
        .catch((err) => {
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
    const EXPORT_KEY = `${JOB_TYPE}:${job.id}`;

    let param = job.data;
    let totalExportElements = 0;
    let redisClient = fetchDep(nconf.get('containerName'), 'RedisClient');
    let csvStream = csv.createWriteStream({ headers: true });

    csvStream
      .pipe(redisWStream(redisClient, EXPORT_KEY))
      .on('finish', () => {
        logger.info(`Job #${job.id} finished writing file, ${totalExportElements} records are being exported`);
        return cb(null);
      });

    let next = (param) => {
      let request = fetchDep(nconf.get('containerName'), 'CallsRequest');

      Q.ninvoke(request, 'getCalls', param)
        .then((result) => {
          let offset = 0;
          let pageElements = result.contents.length;
          let totalPages = result.totalPages;
          let pageNumber = result.pageNumber;

          totalExportElements += pageElements;

          // end the redis stream if all elements have been exported
          if (pageElements === 0) {
            csvStream.end();
          }

          while (offset < pageElements) {
            let row = _.pick(result.contents[offset], CDR_EXPORT.DATA_FIELDS);
            csvStream.write(humanizeFields(row));
            offset++;
          }

          if (pageNumber < totalPages) {
            param.page++;

            // A hack to prevent progress becomes 100% to avoid job to end before file stream to be ready for download
            job.progress(pageNumber, totalPages + 1, { nextRow: pageNumber });
            next(param);
          }
        })
        .catch((err) => { return cb(err); })
        .done();

    }

    next(param);
  }
}
