import _ from 'lodash';
import Q from 'q';
import express from 'express';
import nconf from 'nconf';
import moment from 'moment';
import Controller from '../controllers/CDRExport';
import {CDR_EXPORT} from '../../config';
import kue from 'kue';
import fs from 'fs';
import passport from 'passport';
import logger from 'winston';

import { fetchDep } from '../utils/bottle';

var controller  = new Controller(fetchDep(nconf.get('containerName'), 'JobQueue'));

var CDRExport = express.Router();

CDRExport.use(function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(401);
  }

  next();
});

CDRExport.get('/:carrierId/calls', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('startDate').notEmpty();
  req.checkQuery('endDate').notEmpty();

  var err = req.validationErrors();
  if (err) {
    return res.status(400).json(err);
  }

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

  params.request = 'CallsRequest';
  params.func = 'getCalls';

  let job = controller.init(params, function(err) {
    if (err) res.status(500).json({error:err});

    return res.status(200).json({id:job.id});
  });

  job.on('complete', function(params) {
    logger.info('Job completed with data ', params);

  }).on('failed attempt', function(errorMessage, doneAttempts) {
    logger.error('Job failed. Attempt %s', doneAttempts, errorMessage);

  }).on('failed', function(errorMessage) {
    logger.error('Job failed', errorMessage);

  }).on('progress', function(progress, data) {
    logger.info('\r  job #%s %s% complete with %s ', job.id, progress, data);

  });

  controller.process();

});

CDRExport.get('/:carrierId/calls/progress', function(req, res) {
  req.checkQuery('exportId').notEmpty();

  var err = req.validationErrors();
  if (err) {
    return res.status(400).json(err);
  }

  kue.Job.get(req.query.exportId, function(err, job) {
    if (job.data.caller_carrier === req.params.carrierId) {
      if (err) return res.status(500).json(err);

      if (job._progress === '100') {
        return res.status(200).json({file:job.result.file, progress:job._progress});
      }

      return res.status(200).json({progress: job._progress});
    }
  });
});

CDRExport.get('/:carrierId/calls/file', function(req, res) {
  req.checkQuery('exportId').notEmpty();

  var err = req.validationErrors();
  if (err) {
    return res.status(400).json(err);
  }

  kue.Job.get(req.query.exportId, function(err, job) {
    if (err) return res.status(500).json(err);
    if (job.data.caller_carrier === req.params.carrierId) {
      // job._progress is a percentage and is recognized as string
      if (job._progress === '100') {
        res.setHeader('Content-disposition', 'attachment; filename=' + CDR_EXPORT.EXPORT_FILENAME);
        res.setHeader('Content-type', 'text/csv');
        var filestream = fs.createReadStream(job.result.file);
        filestream.pipe(res);
      }
    }
  });
});

module.exports = CDRExport;
