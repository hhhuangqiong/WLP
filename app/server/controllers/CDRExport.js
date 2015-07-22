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
import {CDR_EXPORT} from '../../config';

var validateCompletedTime = function(completedTime) {
  let nowTimestamp = moment().format('x');
  let difference = nowTimestamp - completedTime;
  return (moment.duration(difference).asHours() >= 4);
}

export default class CDRExport {

  constructor(jobQueue) {
    this.queue = jobQueue.createQueue();
    this.queue.on('job enqueue', function(id, type) {
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

    this.job = null;
  }

  // initialize an export job
  init(query, cb) {
    this.job = this.queue.create(JOB_TYPE, query).attempts(CDR_EXPORT.ATTEMPTS).save(cb);
    return this.job;
  }

  process() {
    this.queue.process(JOB_TYPE, this.exportCSV);
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
    if (!param.request || !param.func) {
      return done(new Error('Request or getFunction is not set'));
    }

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
     * @param  {string}   param.request - already defined, specify which request obj to use referenced in /app/lib
     * @param  {string}   param.func - already defined, specify which function of the request obj to use referenced in /app/lib
     *
     * @param  {Function} done - pass in by kue, reference https://github.com/Automattic/kue#processing-jobs
     */
    function next(param, done) {
      let params = param;
      let requestName = param.request;
      let request = fetchDep(nconf.get('containerName'), param.request);
      let func = param.func;
      delete params.request;
      delete params.func;
      request[func](params, (err, result) => {
        if (err)
          return done(new Error(err));

        let totalElements = result.contents.length;
        let totalPages = result.totalPages;
        let pageSize = result.pageSize;
        let pageNumber = result.pageNumber;
        let offset = result.offset;

        while (offset < totalElements) {
          let row = _.pick(result.contents[offset], CDR_EXPORT.DATA_FIELDS);
          /* jscs: disable */
          row.callee = row.callee;
          row.start_time = moment(row.start_time).format('YYYY-MM-DD h:mm:ss a');
          row.end_time = moment(row.end_time).format('YYYY-MM-DD h:mm:ss a');
          row.answer_time = moment(row.answer_time).format('YYYY-MM-DD h:mm:ss a');
          row.duration = row.duration + 's';
          /* jscs: enable */
          csvStream.write(row);
          offset++;
          job.progress(offset, totalElements, {nextRow: offset === totalElements ? 'Job completed.' : offset });
        }

        // exporting finished
        if (offset === totalElements) {
          /* jscs: disable */
          job.data.file = path.join(os.tmpdir(), job.created_at + '-' + job.id + '.csv');
          done(null, {file:job.data.file});
          /* jscs: enable */
        }

        // there is next page to export
        if (offset < totalElements) {
          params.request = requestName;
          params.func = func;
          params.page = +pageNumber + 1;
          next(params, done);
        }
      });

    }

    next(param, done);
  }

  getJobId() {
    return this.job.id;
  }
}

export const JOB_TYPE = 'export';
