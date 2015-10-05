import _ from 'lodash';
import Q from 'q';
import nconf from 'nconf';
import moment from 'moment';
import CDRExportTask from '../tasks/CDRExport';
import {CDR_EXPORT} from '../../config';
import kue from 'kue';
import fs from 'fs';
import passport from 'passport';
import logger from 'winston';

import { fetchDep } from '../utils/bottle';

let getCarrierCalls = (req, res) => {
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

  let task = new CDRExportTask(fetchDep(nconf.get('containerName'), 'Kue'), params);

  task.ready().then((job) => {

    res.status(200).json({id:job.id});

    task.start();

  }, (err) => {
    res.status(500).json({error:err});
  }).done();

};

let getCarrierCallsProgress = (req, res) => {
  req.checkQuery('exportId').notEmpty();

  var err = req.validationErrors();
  if (err) {
    return res.status(400).json({ message: 'Invalid export identifier'});
  }

  kue.Job.get(req.query.exportId, function(err, job) {
    if (err) return res.status(400).json({ message: 'Invalid export identifier'});

    if (job.failed_at) return res.status(400).json({ message: 'Job failed' });

    let progress = job._progress || '0';

    if (progress === '100') {
      return res.status(200).json({file:job.result.file, progress:job._progress});
    }

    return res.status(200).json({progress: progress});
  });
};

let getCarrierCallsFile = (req, res) => {
  req.checkQuery('exportId').notEmpty();

  var err = req.validationErrors();
  if (err) {
    return res.status(400).json(err);
  }

  kue.Job.get(req.query.exportId, function(err, job) {

    if (err) return res.status(400).json({ message: 'Invalid export identifier'});
    // job._progress is a percentage and is recognized as string
    if (job._progress === '100') {
      res.setHeader('Content-disposition', 'attachment; filename=' + CDR_EXPORT.EXPORT_FILENAME);
      res.setHeader('Content-type', 'text/csv');

      var filestream = fs.createReadStream(job.result.file);

      filestream.pipe(res);

      filestream.on('error', function(err) {
        return res.status(400).json({ message: err });
      });
    }
    else {
      return res.status(400).json({ message: 'exporting in progress:' + job._progress});
    }

  });
};

export {
  getCarrierCalls,
  getCarrierCallsProgress,
  getCarrierCallsFile
};
