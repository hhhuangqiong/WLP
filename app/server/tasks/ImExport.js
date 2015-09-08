import _ from 'lodash';
import csv from 'fast-csv';
import nconf from 'nconf';
import kue from 'kue';
import logger from 'winston';
import Q from 'q';
import redisWStream from 'redis-wstream';

import { fetchDep } from '../utils/bottle';
import { IM_EXPORT } from '../../config';
import { getCountryName, beautifyTime, stringifyNumbers, sanitizeNull } from '../utils/StringFormatter';

const JOB_TYPE = 'exportIm';

/**
 * make export field to be readable by human in csv format file.
 * @param  {object}   param - may contain following
 * @param  {integer}   param.device_id - stringify to avoid incorrect format parsing using Excel
 * @param  {string}   param.origin - to be country name instead of country code
 * @param  {string}   param.destination - to be country name instead of country code
 * @param  {integer}   param.timestamp - to be human readable date time format
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

/***
 * @constructor ImExport
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
      let request = fetchDep(nconf.get('containerName'), 'ImRequest');

      Q.ninvoke(request, 'getImStat', param)
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
            let row = _.pick(result.contents[offset], IM_EXPORT.DATA_FIELDS);
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
