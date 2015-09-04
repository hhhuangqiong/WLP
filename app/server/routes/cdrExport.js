// TODO rename this file with "-Handlers" suffix to denoting it's not exporting the `router` object

import _ from 'lodash';
import fs from 'fs';
import kue from 'kue';
import nconf from 'nconf';

import { fetchDep } from '../utils/bottle';
import { CDR_EXPORT } from '../../config';
import CDRExportTask from '../tasks/CDRExport';

import responseError from '../utils/responseError';

import {
  JOB_FAILED_ERROR, GET_JOB_ERROR, REQUEST_VALIDATION_ERROR,
  FILE_STREAM_ERROR, INCOMPELETE_JOB_ERROR
} from '../utils/exportErrorTypes';

let getCarrierCalls = (req, res) => {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('startDate').notEmpty();
  req.checkQuery('endDate').notEmpty();

  var err = req.validationErrors();

  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  let params = {
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    caller_carrier: req.params.carrierId,
    from: req.query.startDate,
    to: req.query.endDate,
    caller: (_.isEmpty(req.query.search)) ? '' : '*' + req.query.search + '*',
    callee: (_.isEmpty(req.query.search)) ? '' : '*' + req.query.search + '*',
    caller_country: req.query.destination,

    // this api starts with page 0
    page: 0,
    size: 1000,
    type: req.query.type
  };

  let task = new CDRExportTask(fetchDep(nconf.get('containerName'), 'Kue'), params);

  task.ready().then((job) => {
    res.status(200).json({id:job.id});
    task.start();
  }, (err) => {
    return responseError(GET_JOB_ERROR, res, err);
  }).done();
};

let getCarrierCallsProgress = (req, res) => {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('exportId').notEmpty();

  let err = req.validationErrors();

  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  kue.Job.get(req.query.exportId, function(err, job) {
    if (err) return responseError(GET_JOB_ERROR, res, err);

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (job.failed_at) return responseError(JOB_FAILED_ERROR, res, job.failed_at);

    let progress = job._progress || '0';

    return res.status(200).json({ progress });
  });
};

let getCarrierCallsFile = (req, res) => {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('exportId').notEmpty();

  let err = req.validationErrors();

  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  kue.Job.get(req.query.exportId, function(err, job) {
    if (err) return responseError(GET_JOB_ERROR, res, err);

    // job._progress is a percentage and is recognized as string
    if (job._progress === '100') {
      res.setHeader('Content-disposition', 'attachment; filename=' + CDR_EXPORT.EXPORT_FILENAME);
      res.setHeader('Content-type', 'text/csv');

      let filestream = fs.createReadStream(job.result.file);

      filestream.on('readable', function() {
        filestream.pipe(res);
      });

      filestream.on('error', function(err) {
        return responseError(FILE_STREAM_ERROR, res, err);
      });
    }
    else {
      return responseError(INCOMPELETE_JOB_ERROR, res, job._progress);
    }

  });
};

export {
  getCarrierCalls,
  getCarrierCallsFile,
  getCarrierCallsProgress
};
