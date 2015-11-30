import _ from 'lodash';
import csv from 'fast-csv';
import nconf from 'nconf';
import kue from 'kue';
import logger from 'winston';
import Q from 'q';
import moment from 'moment';
import redisWStream from 'redis-wstream';

import { fetchDep } from '../utils/bottle';
import EXPORTS from '../../config/export';
import { CALLS, IM, VERIFICATION, END_USER } from '../../main/file-export/constants/ExportType';

import { getCountryName, beautifyTime, stringifyNumbers, parseDuration, sanitizeNull } from '../../utils/StringFormatter';

const PAGE_START_INDEX = 0;
const PAGE_SIZE = 1000;

const MISSING_PAGE_DATA_MSG = 'Invalid pageNumber/totalPages';

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
export default class ExportTask {
  constructor(kueue, param, query) {
    let deferred = Q.defer();

    this.kueue = kueue;
    this.jobType = param.jobType || query.exportType;
    this.exportType = query.exportType;
    this.job = deferred.promise;
    this.job.getExportConfig = this.getExportConfig;

    param = this.prepareJob(param, query);

    let job = this.kueue.create(this.exportType, param).save((err) => {
      if (err) {
        logger.error(`Unable to create ${this.exportType} job`, err);
        deferred.reject(err);
      } else {
        logger.info(`Created ${this.exportType} job successfully. ${job.id}`);
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
      logger.info('\r  job #%s %s% complete with %s', job.id, progress, JSON.stringify(data));
    });
  }

  /**
   * Aggregate params and query
   * @returns {object} a javaScript object contains data query for sending request
   *
   * @param {params} request params
   * @param {query} request query
   */
  prepareJob(params, query) {
    let job = {};

    job[IM] = () => {
      return {
        carrier: params.carrierId,
        from: moment(query.fromTime, 'x').toISOString(),
        to: moment(query.toTime, 'x').toISOString(),
        message_type: ['text', 'image', 'audio', 'video', 'remote', 'animation', 'sticker', 'voice_sticker', 'ephemeral_image'],
        destination: query.destination,
        origin: query.origin,
        page: PAGE_START_INDEX,
        size: PAGE_SIZE
      };
    };

    job[CALLS] = () => {
      return {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        caller_carrier: params.carrierId,
        from: query.startDate,
        to: query.endDate,
        caller: (_.isEmpty(query.search)) ? '' : '*' + query.search + '*',
        callee: (_.isEmpty(query.search)) ? '' : '*' + query.search + '*',
        caller_country: query.destination,
        page: PAGE_START_INDEX,
        size: PAGE_SIZE,
        type: query.type
      };
    };

    job[VERIFICATION] = () => {
      return {
        carrier: params.carrierId,
        from: query.from,
        to: query.to,
        method: query.verificationType,
        platform: query.osType,
        page: PAGE_START_INDEX,
        size: PAGE_SIZE,
      };
    };

    job[END_USER] = () => {
      return {
        carrier: params.carrierId,
        from: query.startDate,
        to: query.endDate,
        page: PAGE_START_INDEX,
        size: PAGE_SIZE,
      };
    };

    return job[this.exportType]();
  }

  /**
   * Makes the generated report human readable
   * @returns {row} fast-csv row instance
   *
   * @param {row} fast-csv row instance
   */
  humanizeFields(exportType, row) {
    switch (exportType) {
      case (IM):
        /* jscs:disable */
        row.device_id = stringifyNumbers(row.device_id);
        /* jscs: enable */

        row.origin = getCountryName(row.origin);
        row.destination = getCountryName(row.destination);

        row.timestamp = beautifyTime(row.timestamp);

        break;

      case (CALLS):
        row.callee = "'" + row.callee + "'";
        row.duration = parseDuration(row.duration);

        /* jscs: disable */
        row.start_time = beautifyTime(row.start_time);
        row.end_time = beautifyTime(row.end_time);
        row.answer_time = beautifyTime(row.answer_time);

        row.caller_country = getCountryName(row.caller_country);
        row.callee_country = getCountryName(row.caller_country);

        row.caller_bundle_id = row.caller_bundle_id || null;
        row.sip_trunk = row.sip_trunk || null;
        /* jscs: enable */

        break;

      case (VERIFICATION):
        /* jscs: disable */
        row.start_time = beautifyTime(row.start_time);
        row.end_time = beautifyTime(row.end_time);

        row.source_country = getCountryName(row.source_country);

        row.device_id = stringifyNumbers(row.device_id);
        row.request_id = stringifyNumbers(row.request_id);
        row.os_version = stringifyNumbers(row.os_version);
        /* jscs: enable */

        row.country = getCountryName(row.country);

        switch(row.type){
          case 'MobileTerminated':
            row.type = 'Call-In';
            break;

          case 'MobileOriginated':
            row.type = 'Call-Out';
            break;
        }

        break;

      case (END_USER):
        row.username = row.username;
        row.creationDate = beautifyTime(row.creationDate);
        row.accountStatus = row.accountStatus;
        row.platform = row.platform;
        row.deviceModel = row.deviceModel;
        row.appBundleId = row.appBundleId;
        row.appVersionNumber = row.appVersionNumber;
        break;
    }

    return sanitizeNull(row);
  }

  /**
   * Map export job from type to config
   * @returns {object} An object that contains export config
   */
  getExportConfig() {
    switch (this.exportType) {
      case IM:
        return EXPORTS.IM;
      case CALLS:
        return EXPORTS.CALLS;
      case VERIFICATION:
        return EXPORTS.VERIFICATION;
      case END_USER:
        return EXPORTS.END_USER;
      default:
        return {};
    }
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
    this.kueue.process(this.exportType, (job, done) => {
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
    const EXPORT_KEY = `${this.exportType}:${job.id}`;

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
      // get the job by id to verify that the job is not removed
      kue.Job.get(job.id, (err, currentJob) => {
        // get job failed, sliently stop the process
        if (err) {
          logger.error(`Could not find job #${job.id}`, err);
          return false;
        }

        let config = this.getExportConfig();
        let request = fetchDep(nconf.get('containerName'), config.EXPORT_REQUEST);

        Q.ninvoke(request, config.EXPORT_REQUEST_EXECUTION, param)
          .then((result) => {
            let contentIndex = 0;

            // Compatible with different naming fields from end point response
            let contents = result.contents || result.content;
            let numberOfContent = contents.length;
            let totalPages = [result.totalPages, result.total_pages].filter(n => n !== undefined)[0];
            let pageNumber = [result.pageNumber, result.page_number].filter(n => n !== undefined)[0];

            // Record number of elements are being exported
            totalExportElements += numberOfContent;

            // Raise error if pageNumber and totalPages are not valid
            if (pageNumber === undefined || totalPages === undefined) {
              return cb({ message: MISSING_PAGE_DATA_MSG });
            }

            // Complete export if no content appear
            if (!numberOfContent) csvStream.end();

            // Extract elements within current page
            while (contentIndex < numberOfContent) {
              let row = _.pick(contents[contentIndex], config.DATA_FIELDS);
              csvStream.write(this.humanizeFields(this.exportType, row));
              contentIndex++;
            }

            // Move to next page if there are more pages
            if (pageNumber < totalPages) {
              param.page++;

              // A hack to prevent progress becomes 100% to avoid job to end before file stream to be ready for download
              job.progress(pageNumber, totalPages + 1, { nextRow: pageNumber });
              next(param);
            }
          })
          .catch((err) => { return cb(err); })
          .done();
      });
    }

    next(param);
  }
}
