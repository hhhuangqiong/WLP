import CompanyService from '../services/Company'

var companiesModule = angular.module('App.Companies', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('companies', {
        abstract: true,
        url: '/companies',
        template: '<div ui-view="header" class="main__main-section__main-view__header"></div><div ui-view class="main__main-section__main-view__contents"></div>',
        resolve: {
          companies: function(CompanyService) {
            return CompanyService.getCompanies();
          }
        }
      })
      .state('companies.index', {
        url: '',
        views: {
          header: {
            templateUrl: '/app/companies/companyHeader',
            controller: 'Companies'
          },
          '': {
            templateUrl: '/app/companies',
            controller: 'Companies'
          }
        }
      })
      .state('companies.index.new', {
        url: '/new',
        views: {
          company: {
            templateUrl: '/app/companies/form',
            controller: 'CompanyForm'
          }
        },
        resolve: {
          company: function(companies, CompanyService) {
            return CompanyService.newCompany();
          }
        }
      })
      .state('companies.index.new.success', {
        url: '',
        views: {
          'company@companies.index': {
            template: '<h1>Successful!</h1>'
          }
        }
      })
      .state('companies.index.new.fail', {
        url: '/new',
        views: {
          'company@companies.index': {
            template: '<h1>Failed!</h1>'
          }
        }
      })
      .state('companies.index.company', {
        url: '/:companyId',
        views: {
          company: {
            templateUrl: '/app/companies/edit',
            controller: 'CompanyForm'
          }
        },
        resolve: {
          company: function($stateParams, CompanyService) {
            return CompanyService.getCompanyById($stateParams.companyId.trim());
          }
        }
      });
  })
  .run(['$rootScope', '$state', function($rootScope, $state, $log) {
    // Making global objects
    $rootScope.$state = $state;
    $rootScope.$log = $log;
  }])
  .controller('Companies', function($scope, companies) {
    $scope.companies = companies;
  })
  .controller('Company', function($scope, company) {
    $scope.company = company;
  })
  .controller('CompanyForm', function($scope, company) {
    $scope.company = company;
    $scope.test = function() { alert('123') };
  })
  .factory('CompanyService', CompanyService);

export default companiesModule;
