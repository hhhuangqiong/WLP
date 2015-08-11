import _ from 'lodash';
import csv from 'fast-csv';
import moment from 'moment';
import fs from 'fs';
import nconf from 'nconf';
import { fetchDep } from '../utils/bottle';
import kue from 'kue';
import logger from 'winston';
import os from 'os';
import path from 'path';
import Q from 'q';
import {CDR_EXPORT} from '../../config';
import COUNTRIES from '../../data/countries.json';

const OUTPUT_TIME_FORMAT = 'YYYY-MM-DD h:mm:ss a';

var validateCompletedTime = function(completedTime) {
  let nowTimestamp = moment().format('x');
  let difference = nowTimestamp - completedTime;
  return (moment.duration(difference).asHours() >= 4);
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

const PLACEHOLDER_FOR_NULL = 'N/A';

function getCountryName(countryAlpha2) {
  if(!countryAlpha2) return PLACEHOLDER_FOR_NULL;

  let countryData = _.find(COUNTRIES, function(country) {
    return country.alpha2 === countryAlpha2.toUpperCase();
  });

  return (countryData || PLACEHOLDER_FOR_NULL).name;
}

export default class CDRExport {

  constructor(kueue, param) {

    this.kueue = kueue;
    this.exportParam = param;

    let deferred = Q.defer();

    this.job = deferred.promise;

    let job = this.kueue.create(JOB_TYPE, param).attempts(CDR_EXPORT.ATTEMPTS).save((err) => {

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

    // since the job queue is shared, this cleanUp mechanism doesn't work
    //this.setupCleanUp();
  }

  setupCleanUp(){
    this.kueue.on('job enqueue', function(id, type) {

      logger.info('Job %s got queued of type %s', id, type);

      this.complete(function(err, ids) {
        if (err) {
          logger.error('Get completed jobs failed', err);
          return;
        }

        ids.forEach(function(id) {
          kue.Job.get(id, function(err, job) {
            if (err) {
              logger.error(`Get job by id:${id} failed`, err);
              return;
            }

            // check if job is finished and has been keep for four hours.
            /* jscs: disable */
            if (validateCompletedTime(job.updated_at) && job._state === 'complete' && job.result) {
              fs.unlink(job.result.file, ()=>{
                job.remove(function() {
                  logger.info('removed ', job.id);
                });
              });
            }
           /* jscs: enable */

          });
        });
      });
      logger.info('Cleaning up old files');
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
   * @returns {Kue.Job} Kue job instance
   */
  start() {
    this.kueue.process(JOB_TYPE, this.exportCSV);
  }



  //job process function
  exportCSV(job, done) {

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
     *
     * @param  {Function} done - pass in by kue, reference https://github.com/Automattic/kue#processing-jobs
     */
    function next(param, done) {
      let request = fetchDep(nconf.get('containerName'), 'CallsRequest');

      request.getCalls(param, (err, result) => {
        if (err)
          return done(new Error(err));

        let totalElements = result.contents.length;
        let totalPages = result.totalPages;
        let pageSize = result.pageSize;
        let pageNumber = result.pageNumber;
        let offset = result.offset;

        while (offset < totalElements) {
          let row = _.pick(result.contents[offset], CDR_EXPORT.DATA_FIELDS);
          // cannot fix code styling since the it's returned from server
          /* jscs: disable */
          row.callee = "'" + row.callee + "'";
          row.start_time = moment(row.start_time).format(OUTPUT_TIME_FORMAT);
          row.end_time = row.end_time ? moment(row.end_time).format(OUTPUT_TIME_FORMAT) : PLACEHOLDER_FOR_NULL;
          row.answer_time = row.answer_time ? moment(row.answer_time).format(OUTPUT_TIME_FORMAT) : PLACEHOLDER_FOR_NULL;
          row.caller_country = getCountryName(row.caller_country);
          row.callee_country = getCountryName(row.callee_country);
          row.duration = row.duration + 's';
          /* jscs: enable */

          csvStream.write(row);
          offset++;
          job.progress(offset, totalElements, {nextRow: offset === totalElements ? 'Job completed.' : offset });
        }

        // exporting finished
        if (offset === totalElements) {
          // caanot fix attributes naming since it's provide by kue
          /* jscs: disable */
          job.data.file = path.join(os.tmpdir(), job.created_at + '-' + job.id + '.csv');
          done(null, {file:job.data.file});
          return;
          /* jscs: enable */
        }

        // there is next page to export
        if (offset < totalElements) {
          param.request = requestName;
          param.page = +pageNumber + 1;
          next(param, done);
        }
      });

    }

    next(param, done);
  }
}

export const JOB_TYPE = 'exportCDR';
