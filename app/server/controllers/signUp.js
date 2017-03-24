import logger from 'winston';

export default function SignUpController(signupRuleRequest) {
    // get '/carriers/:carrierId/signupRules'
  function getSignupRules(req, res) {
    req.checkParams('carrierId').notEmpty();

    const { carrierId } = req.params;

    signupRuleRequest.getSignupRules(carrierId, req.query, (err, result) => {
      if (err) {
        logger.error('error occurred when fetching signupRules', err);
        const { code, message, timeout, status } = err;

        res.status(status || 500).json({
          error: {
            code,
            message,
            timeout,
          },
        });
        return;
      }
      res.json(result);
    });
  }

  // post '/carriers/:carrierId/signupRules'
  function createSignupRules(req, res) {
    req.checkParams('carrierId').notEmpty();

    const { carrierId } = req.params;

    signupRuleRequest.createSignupRules(carrierId, req.user.username, req.body.identities, (err, result) => {
      if (err) {
        logger.error('error occurred when creating signupRules', err);
        const { code, message, timeout, status } = err;

        res.status(status || 500).json({
          error: {
            code,
            message,
            timeout,
          },
        });
        return;
      }
      res.json(result);
    });
  }

  // delete '/carriers/:carrierId/signupRules/:id'
  function deleteSignupRule(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkParams('id').notEmpty();

    const { carrierId, id } = req.params;

    signupRuleRequest.deleteSignupRule(carrierId, id, (err, result) => {
      if (err) {
        logger.error('error occurred when deleting signupRule', err);
        const { code, message, timeout, status } = err;

        res.status(status || 500).json({
          error: {
            code,
            message,
            timeout,
          },
        });
        return;
      }
      res.json(result);
    });
  }
  return {
    getSignupRules,
    createSignupRules,
    deleteSignupRule,
  };
}
