import Company from '../objects/Company'

class CompanyService {

  constructor($state, $q, ApiService) {
    this.$state = $state;
    this.$q = $q;
    this.ApiService = ApiService;
    this.companies = null;
  }

  getCompanyById(id) {
    var _company = null;
    this.companies.forEach(function (item) {
      if (item.data._id) {
        if (item.data._id.trim() == id) {
          _company = item;
        }
      }
    });

    return _company;
  }

  getCompanies() {

    if (this.companies) {
      return this.companies;
    }

    var deferred = this.ApiService.$q.defer();

    this.ApiService.get('companies')
      .then((response) => {
        var companies = response.result;
        this.companies = [];

        for (var key in companies) {
          this.newCompany(companies[key]);
        }

        return deferred.resolve(this.companies);
      });

    return deferred.promise;
  }

  newCompany(initData) {
    if (this.companies.length == 0 || this.isValidData(initData)) {
      // For creating existing Company Object
      var _company = new Company(this.$state, this.$q, this.ApiService, initData);
      this.companies.push(_company);
      return _company;
    } else {
      // For creating new Company Object
      // Lazy load: if lastObject exists, return it rather than creating new Company Object
      var lastObject = this.companies.slice(-1).pop();
      if (lastObject) {
        if (this.isValidData(lastObject.data)) {
          var _company = new Company(this.$state, this.$q, this.ApiService, initData);
          this.companies.push(_company);
          return _company;
        } else {
          return lastObject;
        }
      } else {
        return lastObject;
      }
    }
  }

  isValidData(data) {
    return (data !== undefined && data !== null && data.id != '')
  }
}

export default function($state, $q, ApiService) {
  return new CompanyService($state, $q, ApiService);
}
