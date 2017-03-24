export default function topUpController(topUpRequest) {
  // '/carriers/:carrierId/topup'
  function getTopUp(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('startDate').notEmpty();
    req.checkQuery('endDate').notEmpty();
    req.checkQuery('number').notEmpty();

    req
      .checkQuery('page')
      .notEmpty()
      .isInt();

    req
      .checkQuery('pageRec')
      .notEmpty()
      .isInt();

    const params = {
      carrier: req.params.carrierId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      number: req.query.number,
      page: req.query.page,
      pageRec: req.query.pageRec,

      // always use like search
      isLikeSearch: true,
    };

    topUpRequest.getTopUp(params, (err, result) => {
      if (err) {
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
    getTopUp,
  };
}
