import _ from 'lodash';
import Q from 'q';
import express from 'express';
import nconf from 'nconf';
import moment from 'moment';
import ImExportTask from '../tasks/ImExport';
import {IM_EXPORT} from '../../config';
import kue from 'kue';
import fs from 'fs';
import passport from 'passport';
import logger from 'winston';

import { fetchDep } from '../utils/bottle';

const UNABLE_LOCATE_EXPORT_FILE = 'Unable to locate exported file. Please try again.';
const PAGE_START_INDEX = 0;
const PAGE_SIZE = 1000;

let router = express.Router();

router.use((req, res, next) => {
  if (!req.isAuthenticated()) { res.status(401); }
  next();
});

router.get('/:carrierId/im', (req, res) => {
  req.checkParams('carrierId').notEmpty();

  let err = req.validationErrors();

  if (err) return res.status(400).json(err);

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
    res.status(500).json({ error: err });
  }).done();
});

router.get('/:carrierId/im/progress', (req, res) => {
  req.checkQuery('exportId').notEmpty();

  let err = req.validationErrors();
  if (err) return res.status(400).json({ message: 'Invalid export identifier'});

  kue.Job.get(req.query.exportId, (err, job) => {
    if (err) return res.status(400).json({ message: 'Invalid export identifier'});

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (job.failed_at) return res.status(400).json({ message: 'Job failed' });

    let progress = job._progress || '0';

    return res.status(200).json({ progress: progress });
  });
});

router.get('/:carrierId/im/file', (req, res) => {
  req.checkQuery('exportId').notEmpty();

  let err = req.validationErrors();
  if (err) return res.status(400).json(err);

  kue.Job.get(req.query.exportId, (err, job) => {
    if (err) return res.status(400).json({ message: 'Invalid export identifier'});

    if (job._progress === '100') {
      res.setHeader('Content-disposition', 'attachment; filename=' + IM_EXPORT.EXPORT_FILENAME);
      res.setHeader('Content-type', 'text/csv');

      var filestream = fs.createReadStream(job.result.file);

      filestream.on('readable', function() {
        filestream.pipe(res);
      });

      filestream.on('error', function(err) {
        return res.status(400).json({ message: err });
      });

    } else {
      return res.status(400).json({ message: 'exporting in progress:' + job._progress});
    }

  });
});

module.exports = router;
