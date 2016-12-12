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
import {
  CALLS,
  IM,
  VERIFICATION,
  END_USER,
  CALLS_COST,
  SMS,
} from '../../main/file-export/constants/ExportType';

import {
  getCountryName,
  beautifyTime,
  stringifyNumbers,
  sanitizeNull,
} from '../../utils/StringFormatter';

const PAGE_START_INDEX = 0;
const PAGE_SIZE = 1000;
const PAGE_SIZE_SMALL = 100;

const MISSING_PAGE_DATA_MSG = 'Invalid pageNumber/totalPages';

/*
 * @constructor ImExport
 * @param {Kue} kueue instance of job queue
 * @param  {object}   param - may contain following
 * @param  {string}   param.carrierId - specific identity from a client account
 * @param  {string}   param.from - timestamp in millisecond
 * @param  {string}   param.to - timestamp in millisecond
 * @param  {number}   param.page - specify starting page, always 0
 * @param  {number}   param.size - specify no. records on each page, always 1000
 * @param  {string}   [param.origin] -
 *   specify 2 letter country code for origin, value is referenced in country-data node package
 * @param  {string}   [param.destination] -
 *   specify 2 letter country code for origin, value is referenced in country-data node package
 *   in /app/lib
 */
export default class ExportTask {
  constructor(kueue, param, query) {
    const deferred = Q.defer();

    this.kueue = kueue;
    this.jobType = param.jobType || query.exportType;
    this.exportType = query.exportType;
    this.job = deferred.promise;
    this.job.getExportConfig = this.getExportConfig;

    param = this.prepareJob(param, query);

    const job = this
      .kueue
      .create(this.exportType, param)
      .save(err => {
        if (err) {
          logger.error(`Unable to create ${this.exportType} job`, err);
          deferred.reject(err);
        } else {
          logger.info(`Created ${this.exportType} job successfully. ${job.id}`);
          deferred.resolve(job);
        }
      });

    job
      .on('complete', completeParam => {
        logger.info('Job completed with data ', completeParam);
      })
      .on('failed attempt', (errorMessage, doneAttempts) => {
        logger.error('Job failed. Attempt %s', doneAttempts, errorMessage);
      })
      .on('failed', errorMessage => {
        logger.error('Job failed', errorMessage);
      })
      .on('progress', (progress, data) => {
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
    const job = {};

    job[IM] = () => (
      {
        carrier: params.carrierId,
        from: moment(query.fromTime, 'x').toISOString(),
        to: moment(query.toTime, 'x').toISOString(),
        message_type: [
          'text',
          'image',
          'audio',
          'video',
          'remote',
          'animation',
          'sticker',
          'voice_sticker',
          'ephemeral_image',
        ],
        destination: query.destination,
        origin: query.origin,
        page: PAGE_START_INDEX,
        size: PAGE_SIZE,
      }
    );

    job[CALLS_COST] = () => (
      {
        carrier: params.carrierId,
        start_date: moment(query.startDate, 'x').toISOString(),
        end_date: moment(query.endDate, 'x').toISOString(),
        page: PAGE_START_INDEX,
        limit: PAGE_SIZE_SMALL,
      }
    );

    job[SMS] = () => (
      {
        carrier: params.carrierId,
        from: query.startDate,
        to: query.endDate,
        source_address_inbound: query.number,
        page: query.page,
        size: query.pageRec,
      }
    );

    job[CALLS] = () => (
      {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        caller_carrier: params.carrierId,
        from: query.startDate,
        to: query.endDate,
        caller: (_.isEmpty(query.search)) ? '' : `*${query.search}*`,
        callee: (_.isEmpty(query.search)) ? '' : `*${query.search}*`,
        caller_country: query.destination,
        page: PAGE_START_INDEX,
        size: PAGE_SIZE,
        type: query.type,
      }
    );

    job[VERIFICATION] = () => (
      {
        carrier: params.carrierId,
        from: query.from,
        to: query.to,
        method: query.verificationType,
        platform: query.osType,
        page: PAGE_START_INDEX,
        size: PAGE_SIZE,
      }
    );

    job[END_USER] = () => (
      {
        carrier: params.carrierId,
        from: query.startDate,
        to: query.endDate,
        page: PAGE_START_INDEX,
        size: PAGE_SIZE,
      }
    );

    return job[this.exportType]();
  }

  /**
   * Makes the generated report human readable
   * @returns {row} fast-csv row instance
   *
   * @param {row} fast-csv row instance
   */
  humanizeFields(exportType, row) {
    let humanizedRow;
    switch (exportType) {
      case IM:
        humanizedRow = {
          ...row,
          device_id: stringifyNumbers(row.device_id),
          stanza_id: stringifyNumbers(row.stanza_id),
          origin: getCountryName(row.origin),
          destination: getCountryName(row.destination),
          timestamp: beautifyTime(row.timestamp),
        };
        break;
      case CALLS:
        humanizedRow = {
          ...row,
          device_id: stringifyNumbers(row.device_id),
          stanza_id: stringifyNumbers(row.stanza_id),
          origin: getCountryName(row.origin),
          destination: getCountryName(row.destination),
          timestamp: beautifyTime(row.timestamp),
        };
        break;
      case VERIFICATION: {
        let type = '';
        switch (row.type) {
          case 'MobileTerminated':
            type = 'Call-In';
            break;
          case 'MobileOriginated':
            type = 'Call-Out';
            break;
          default:
            break;
        }
        humanizedRow = {
          ...row,
          start_time: beautifyTime(row.start_time),
          end_time: beautifyTime(row.end_time),
          source_country: getCountryName(row.source_country),
          device_id: stringifyNumbers(row.device_id),
          request_id: stringifyNumbers(row.request_id),
          os_version: stringifyNumbers(row.os_version),
          country: getCountryName(row.country),
          type,
        };
        break;
      }
      case END_USER:
        humanizedRow = {
          ...row,
          creationDate: beautifyTime(row.creationDate),
        };
        break;
      case SMS:
        humanizedRow = {
          ...row,
          request_date: beautifyTime(row.request_date),
          response_date: beautifyTime(row.response_date),
          country: getCountryName(row.country),
        };
        break;
      default:
        humanizedRow = { ...row };
        break;
    }

    return sanitizeNull(humanizedRow);
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
      case CALLS_COST:
        return EXPORTS.CALLS_COST;
      case VERIFICATION:
        return EXPORTS.VERIFICATION;
      case END_USER:
        return EXPORTS.END_USER;
      case SMS:
        return EXPORTS.SMS;
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
      this.exportCSV(job).then(() => done(null)).catch(done);
    });
  }

// job process function
  exportCSV(job) {
    const EXPORT_KEY = `${this.exportType}:${job.id}`;
    const params = job.data;
    const redisClient = fetchDep(nconf.get('containerName'), 'RedisClient');
    const csvStream = csv.createWriteStream({ headers: true });

    let totalExportElements = 0;

    return new Promise((resolve, reject) => {
      csvStream
        .pipe(redisWStream(redisClient, EXPORT_KEY))
        .on('finish', () => {
          logger.info(
            `Job #${job.id} finished writing file, ${totalExportElements} records are being exported`
          );
          resolve();
          return;
        });

      const next = param => {
        // get the job by id to verify that the job is not removed
        kue.Job.get(job.id, err => {
          // get job failed, sliently stop the process
          if (err) {
            logger.error(`Could not find job #${job.id}`, err);
            return false;
          }

          const config = this.getExportConfig();
          const request = fetchDep(nconf.get('containerName'), config.EXPORT_REQUEST);
          const invoke = request[config.EXPORT_REQUEST_EXECUTION].bind(request);
          invoke(param).then(result => {
            let contentIndex = 0;
            // Compatible with different naming fields from end point response
            const contents = result.contents || result.content;
            const numberOfContent = contents.length;
            const totalPages = [
              result.totalPages,
              result.total_pages,
            ].filter(n => n !== undefined)[0];

            const pageNumber = [
              result.pageNumber,
              result.page_number,
            ].filter(n => n !== undefined)[0];

            // Record number of elements are being exported
            totalExportElements += numberOfContent;

            // Raise error if pageNumber and totalPages are not valid
            if (pageNumber === undefined || totalPages === undefined) {
              reject(new Error(MISSING_PAGE_DATA_MSG));
              return;
            }

            // Complete export if no content appear
            if (!numberOfContent) {
              csvStream.end();
            }

            // Extract elements within current page
            while (contentIndex < numberOfContent) {
              const row = _.pick(contents[contentIndex], config.DATA_FIELDS);
              csvStream.write(this.humanizeFields(this.exportType, row));
              contentIndex++;
            }

            // Move to next page if there are more pages
            if (pageNumber < totalPages) {
              param.page++;

              // A hack to prevent progress becomes 100%
              //   to avoid job to end before file stream to be ready for download
              job.progress(pageNumber, totalPages + 1, { nextRow: pageNumber });
              next(param);
            }
          })
          .catch(reject);
        });
      };
      next(params);
    });
  }
}
