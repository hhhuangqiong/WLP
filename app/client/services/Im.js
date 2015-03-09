class ImService {

  constructor($state, $q, ApiService) {
    this.$state = $state;
    this.$q = $q;
    this.ApiService = ApiService;
    this.methods = {
      Ims: {
        url: "/api/1.0/imMessageStat",
        type: "application/json"
      }
    }
  }

  getImMessages(query) {
    var deferred = this.ApiService.$q.defer();

    this.ApiService.get(this.methods.Ims, query)
      .then((response) => {
        if (response.error)
          return deferred.resolve(false);

        return deferred.resolve(response);
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
  return new ImService($state, $q, ApiService);
}
