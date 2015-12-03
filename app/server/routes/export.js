import fs from 'fs';
import kue from 'kue';
import nconf from 'nconf';
import redisRStream from 'redis-rstream';

import { fetchDep } from '../utils/bottle';
import EXPORTS from '../../config/export';
import ExportTask from '../tasks/Export';
import { CALLS, IM, VERIFICATION } from '../../main/file-export/constants/ExportType';

import responseError from '../utils/responseError';

import {
  JOB_FAILED_ERROR, GET_JOB_ERROR, REQUEST_VALIDATION_ERROR,
  FILE_STREAM_ERROR, INCOMPELETE_JOB_ERROR
} from '../utils/exportErrorTypes';

let getExportConfig = (type) => {
  return EXPORTS[type.toUpperCase()] || {};
};

// use no browser cache
function setCacheControl(res) {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', 0);
}

// '/:carrierId/export'
let getCarrierExport = (req, res) => {
  req.checkParams('carrierId').notEmpty();

  let err = req.validationErrors();

  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  setCacheControl(res);

  let task = new ExportTask(fetchDep(nconf.get('containerName'), 'Kue'), req.params, req.query);

  task.ready().then((job) => {
    res.status(200).json({ id: job.id });
    task.start();
  }, (err) => {
    return responseError(GET_JOB_ERROR, res, err);
  }).done();
};

// '/:carrierId/export/cancel'
let getCarrierExportCancel = (req, res) => {
  req.checkParams('carrierId').notEmpty();

  let err = req.validationErrors();

  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  setCacheControl(res);

  kue.Job.get(req.query.exportId, (err, job) => {
    if (err) return responseError(GET_JOB_ERROR, res, err);

    job.remove(function(err){
      if (err) return responseError(GET_JOB_ERROR, res, err);
      return res.status(200).json({ id: job.id });
    });
  });
};

// '/:carrierId/export/progress'
let getCarrierExportFileProgress = (req, res) => {
  req.checkQuery('exportId').notEmpty();

  let err = req.validationErrors();

  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  kue.Job.get(req.query.exportId, (err, job) => {
    if (err) return responseError(GET_JOB_ERROR, res, err);

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (job.failed_at) return responseError(JOB_FAILED_ERROR, res, job.failed_at);

    let progress = job._progress || '0';

    setCacheControl(res);

    return res.status(200).json({ progress });
  });
};

// '/:carrierId/export/file'
let getCarrierExportFile = (req, res) => {
  req.checkQuery('exportId').notEmpty();

  let err = req.validationErrors();
  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  kue.Job.get(req.query.exportId, (err, job) => {
    if (err) return responseError(GET_JOB_ERROR, res, err);

    let jobConfig = getExportConfig(job.type);

    setCacheControl(res);

    if (job._progress === '100') {
      res.set('Content-Disposition', 'attachment; filename=' + jobConfig.EXPORT_FILENAME);
      res.set('Content-Type', 'text/csv');
      setCacheControl(res);

      let redisClient = fetchDep(nconf.get('containerName'), 'RedisClient');
      let exportFileStream = redisRStream(redisClient, `${job.type}:${job.id}`);

      exportFileStream.pipe(res);

      exportFileStream.on('error', (err) => {
        return responseError(FILE_STREAM_ERROR, res, err);
      });

    } else {
      return responseError(INCOMPELETE_JOB_ERROR, res, job._progress);
    }

  });
};

export {
  getCarrierExport,
  getCarrierExportCancel,
  getCarrierExportFile,
  getCarrierExportFileProgress
};
