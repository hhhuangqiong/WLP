export default function resourceController(aclResolver) {
  async function getCarrierResources(req, res, next) {
    try {
      const carrierId = req.params.carrierId;
      const carrierResources = await aclResolver.getCarrierResources({ carrierId });
      res.json(carrierResources);
    } catch (e) {
      next(e);
    }
  }
  return {
    getCarrierResources,
  };
}
