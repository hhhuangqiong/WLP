import CompanyService from '../services/Company'

var companiesModule = angular.module('App.Companies', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('app.companies', {
        abstract: true,
        url: '/companies',
        resolve: {
          companies: function(CompanyService) {
            return CompanyService.getCompanies();
          }
        }
      })
      .state('app.companies.index', {
        url: '',
        views: {
          'supplement@': {
            templateUrl: '/app/companies/view/header'
          },
          'contents@': {
            templateUrl: '/app/companies',
            controller: 'Companies'
          }
        }
      })
      .state('app.companies.index.new', {
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
      .state('app.companies.index.new.success', {
        url: '',
        views: {
          'company@companies.index': {
            template: '<h1>Successful!</h1>'
          }
        }
      })
      .state('app.companies.index.new.fail', {
        url: '/new',
        views: {
          'company@companies.index': {
            template: '<h1>Failed!</h1>'
          }
        }
      })
      .state('app.companies.index.company', {
        url: '/:companyId',
        views: {
          company: {
            templateUrl: '/app/companies/edit',
            controller: 'CompanyForm'
          }
        },
        resolve: {
          // TODO: no hints for resolving variable companies
          company: function($stateParams, CompanyService, companies) {
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
  })
  .factory('CompanyService', CompanyService);

export default companiesModule;
