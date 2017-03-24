import _ from 'lodash';
import Q from 'q';

export default function applicationController(applicationRequest) {
    /**
   * Acquire the application ID's with carrierId.
   * The `carrierId` must be embedded in the request object's params.
   * The `userId` must be embedded in the request object's query.
   *
   * @method
   * @param {Request} req  The node request object
   * @param {Response} res  The node response object
   */
  function getApplicationIds(req, res) {
    const { carrierId } = req.params;
    Q.ninvoke(applicationRequest, 'getApplications', carrierId)
      .then(result => {
        // result can be an object or array depends on the number of applications
        // object if 1, array if multiple
        // therefore we unify the structure here to array
        const mResult = [].concat(result);
        const appIds = _.map(mResult, app => app.applicationId);
        res.json(appIds);
      });
  }

  /**
   * Acquire the application service configs with carrierId
   *
   * @method
   * @param {Request} req  The node request object
   * @param {Response} res  The node response object
   */
  function getApplications(req, res) {
    const { carrierId } = req.params;
    Q.allSettled([
      Q.ninvoke(applicationRequest, 'getApplications', carrierId),
      Q.ninvoke(applicationRequest, 'getApiService', carrierId),
    ]).spread((applications, services) => {
      const result = {
        applicationId: null,
        developerKey: null,
        developerSecret: null,
        applications: {
          ios: {},
          android: {},
        },
      };

      if (services.value) {
        _.filter(services.value, service => {
          if (service.type === 'API') {
            _.merge(result, {
              developerKey: service.key,
              developerSecret: service.secret,
            });
          }
        });
      }

      if (applications.value) {
        result.applicationId = applications.value.applicationId;
        _.filter(applications.value.applications, application => {
          if (application.platform.match(/.ios$/)) {
            result.applications.ios = application;
          } else if (application.platform.match(/.android$/)) {
            result.applications.android = application;
          }
        });
      }

      res.json(result);
    });
  }

  return {
    getApplicationIds,
    getApplications,
  };
}
