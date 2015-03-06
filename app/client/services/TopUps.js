class TopUpsService {

  constructor($state, $q, ApiService) {
    this.$state = $state;
    this.$q = $q;
    this.ApiService = ApiService;
    this.endUsers;
    this.methods = {
      topUps: {
        url: "/api/1.0/transactionHistory",
        type: "application/json",
        method: "post"
      }
    }
  }

  getTransactions(query) {
    var deferred = this.ApiService.$q.defer();

    this.ApiService.execute(this.methods.topUps, query)
      .then((response) => {
        if (response.error)
          return deferred.resolve(false);

        return deferred.resolve(response.result.history);
      })
      .catch((err) => {
        return deferred.resolve({
          error: err
        });
      });

    return deferred.promise;
  }
}

export default function($state, $q, ApiService) {
  return new TopUpsService($state, $q, ApiService);
}
