import kue from 'kue';
import nconf from 'nconf';
import redisRStream from 'redis-rstream';

import { fetchDep } from '../utils/bottle';
import EXPORTS from '../../config/export';
import ExportTask from '../tasks/Export';

import responseError from '../utils/responseError';

import {
  JOB_FAILED_ERROR,
  GET_JOB_ERROR,
  REQUEST_VALIDATION_ERROR,
  FILE_STREAM_ERROR,
  INCOMPELETE_JOB_ERROR,
} from '../utils/exportErrorTypes';

const getExportConfig = (type) => {
  return EXPORTS[type.toUpperCase()] || {};
};

// '/:carrierId/export'
const getCarrierExport = (req, res) => {
  req.checkParams('carrierId').notEmpty();

  const err = req.validationErrors();

  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  const task = new ExportTask(fetchDep(nconf.get('containerName'), 'Kue'), req.params, req.query);

  task.ready().then((job) => {
    res.status(200).json({ id: job.id });
    task.start();
  }, err => {
    return responseError(GET_JOB_ERROR, res, err);
  }).done();
};

// '/:carrierId/export/cancel'
const getCarrierExportCancel = (req, res) => {
  req.checkParams('carrierId').notEmpty();

  const err = req.validationErrors();

  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  kue.Job.get(req.query.exportId, (err, job) => {
    if (err) return responseError(GET_JOB_ERROR, res, err);

    job.remove(function (err) {
      if (err) return responseError(GET_JOB_ERROR, res, err);
      return res.status(200).json({ id: job.id });
    });
  });
};

// '/:carrierId/export/progress'
const getCarrierExportFileProgress = (req, res) => {
  req.checkQuery('exportId').notEmpty();

  const err = req.validationErrors();

  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  kue.Job.get(req.query.exportId, (err, job) => {
    if (err) return responseError(GET_JOB_ERROR, res, err);

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (job.failed_at) return responseError(JOB_FAILED_ERROR, res, job.failed_at);

    const progress = job._progress || '0';

    return res.status(200).json({ progress });
  });
};

// '/:carrierId/export/file'
const getCarrierExportFile = (req, res) => {
  req.checkQuery('exportId').notEmpty();

  const err = req.validationErrors();
  if (err) return responseError(REQUEST_VALIDATION_ERROR, res, err);

  kue.Job.get(req.query.exportId, (err, job) => {
    if (err) return responseError(GET_JOB_ERROR, res, err);

    const jobConfig = getExportConfig(job.type);

    if (job._progress === '100') {
      res.set('Content-Disposition', 'attachment; filename=' + jobConfig.EXPORT_FILENAME);
      res.set('Content-Type', 'text/csv');

      const redisClient = fetchDep(nconf.get('containerName'), 'RedisClient');
      const exportFileStream = redisRStream(redisClient, `${job.type}:${job.id}`);

      exportFileStream.pipe(res);

      exportFileStream.on('error', err => {
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
  getCarrierExportFileProgress,
};
