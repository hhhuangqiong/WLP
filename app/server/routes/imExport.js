import fs from 'fs';
import kue from 'kue';
import nconf from 'nconf';

import { fetchDep } from '../utils/bottle';
import { IM_EXPORT } from '../../config';
import ImExportTask from '../tasks/ImExport';

const PAGE_START_INDEX = 0;
const PAGE_SIZE = 1000;

import responseError from '../utils/responseError';

import {
  JOB_FAILED_ERROR, GET_JOB_ERROR, REQUEST_VALIDATION_ERROR,
  FILE_STREAM_ERROR, INCOMPELETE_JOB_ERROR
} from '../utils/exportErrorTypes';

// '/:carrierId/im'
let getCarrierIM = (req, res) => {
  req.checkParams('carrierId').notEmpty();

  let err = req.validationErrors();

  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  let params = {
    carrier: req.params.carrierId,
    from: req.query.fromTime,
    to: req.query.toTime,
    destination: req.query.destination,
    origin: req.query.origin,
    page: PAGE_START_INDEX,
    size: PAGE_SIZE
  };

  let task = new ImExportTask(fetchDep(nconf.get('containerName'), 'Kue'), params);

  task.ready().then((job) => {
    res.status(200).json({ id: job.id });
    task.start();
  }, (err) => {
    return responseError(GET_JOB_ERROR, res, err);
  }).done();
};

// '/:carrierId/im/progress'
let getCarrierIMFileProgress = (req, res) => {
  req.checkQuery('exportId').notEmpty();

  let err = req.validationErrors();

  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  kue.Job.get(req.query.exportId, (err, job) => {
    if (err) return responseError(GET_JOB_ERROR, res, err);

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (job.failed_at) return responseError(JOB_FAILED_ERROR, res, job.failed_at);

    let progress = job._progress || '0';

    return res.status(200).json({ progress: progress });
  });
};

// '/:carrierId/im/file'
let getCarrierIMFile = (req, res) => {
  req.checkQuery('exportId').notEmpty();

  let err = req.validationErrors();
  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  kue.Job.get(req.query.exportId, (err, job) => {
    if (err) return responseError(GET_JOB_ERROR, res, err);

    if (job._progress === '100') {
      res.setHeader('Content-disposition', 'attachment; filename=' + IM_EXPORT.EXPORT_FILENAME);
      res.setHeader('Content-type', 'text/csv');

      var filestream = fs.createReadStream(job.result.file);

      filestream.on('readable', function() {
        filestream.pipe(res);
      });

      filestream.on('error', function(err) {
        return responseError(FILE_STREAM_ERROR, res, err);
      });

    } else {
      return responseError(INCOMPELETE_JOB_ERROR, res, job._progress);
    }

  });
};

export {
  getCarrierIM,
  getCarrierIMFile,
  getCarrierIMFileProgress
};
