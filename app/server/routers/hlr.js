import { Router } from 'express';
import request from 'superagent';

const router = Router();

// Sample Request
// https://www.hlr-lookups.com/api/?action=submitSyncLookupRequest&msisdn=85295860801&username=gutzeit&password=gutzeit&route=IP1

router.get('/hlr-lookup/:msisdn', function (req, res) {
  const { msisdn } = req.params;

  const params = {
    action: 'submitSyncLookupRequest',
    username: 'gutzeit',
    password: 'gutzeit',
    route: 'IP1',
    msisdn,
  };

  request
    .get('https://www.hlr-lookups.com/api/')
    .query(params)
    .accept('json')
    .end(function (err, qRes) {
      if (err) {
        res.json({ success: false });
      }

      res.json(qRes.body || { success: false });
    });
});

export default router;
