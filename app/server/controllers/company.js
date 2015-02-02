var express = require('express');
var logger = require('winston');
var CompanyController = (function () {
    function CompanyController() {
    }
    CompanyController.prototype.index = function (req, res, next) {
        res.render('pages/companies/index');
    };
    CompanyController.prototype.companyHeader = function (req, res, next) {
        res.render('pages/companies/header');
    };
    CompanyController.prototype.new = function (req, res, next) {
        res.render('pages/companies/form');
    };
    CompanyController.prototype.edit = function (req, res, next) {
        res.render('pages/companies/edit');
    };
    return CompanyController;
})();
module.exports = CompanyController;
