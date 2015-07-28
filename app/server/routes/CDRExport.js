import _ from 'lodash';
import Q from 'q';
import express from 'express';
import nconf from 'nconf';
import moment from 'moment';
import CDRExportTask from '../tasks/CDRExport';
import {CDR_EXPORT} from '../../config';
import kue from 'kue';
import fs from 'fs';
import passport from 'passport';
import logger from 'winston';

import { fetchDep } from '../utils/bottle';

var router = express.Router();

router.use(function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(401);
  }

  next();
});

router.get('/:carrierId/calls', function(req, res) {
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

  let task = new CDRExportTask(fetchDep(nconf.get('containerName'), 'fileExportQueue'), params);

  task.ready().then((job) => {

    res.status(200).json({id:job.id});

    task.start();

  }, (err) => {
    res.status(500).json({error:err});
  }).done();

});

router.get('/:carrierId/calls/progress', function(req, res) {
  req.checkQuery('exportId').notEmpty();

  var err = req.validationErrors();
  if (err) {
    return res.status(400).json(err);
  }

  kue.Job.get(req.query.exportId, function(err, job) {
    if (err) return res.status(500).json(err);

    if (job._progress === '100') {
      return res.status(200).json({file:job.result.file, progress:job._progress});
    }

    return res.status(200).json({progress: job._progress});
  });
});

router.get('/:carrierId/calls/file', function(req, res) {
  req.checkQuery('exportId').notEmpty();

  var err = req.validationErrors();
  if (err) {
    return res.status(400).json(err);
  }

  kue.Job.get(req.query.exportId, function(err, job) {
    if (err) return res.status(500).json(err);
    // job._progress is a percentage and is recognized as string
    if (job._progress === '100') {
      res.setHeader('Content-disposition', 'attachment; filename=' + CDR_EXPORT.EXPORT_FILENAME);
      res.setHeader('Content-type', 'text/csv');
      var filestream = fs.createReadStream(job.result.file);
      filestream.pipe(res);
    }
    else {
      return res.status(400).json({ message: 'exporting in progress:' + job._progress});
    }

  });
});

module.exports = router;
