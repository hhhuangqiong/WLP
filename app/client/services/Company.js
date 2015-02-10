import Company from '../objects/Company'
import Service from './Service'

class CompanyService extends Service {

  constructor($state, $q, ApiService) {
    super($state, $q, ApiService, Company);
    this.methods    = {
      list: {
        url: "/app/companies",
        type: "application/json",
        method: "get"
      }
    }
  }

  getCompanyById(id) {
    return this.getEntityById(id);
  }

  getCompanies() {
    return this.getEntities();
  }

  newCompany(initData) {
    return this.getNewEntity(initData);
  }
}

export default function($state, $q, ApiService) {
  return new CompanyService($state, $q, ApiService);
}
