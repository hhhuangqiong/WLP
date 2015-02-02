<<<<<<< Updated upstream
/// <reference path='../../../typings/express/express.d.ts' />
/// <reference path='../../../typings/lodash/lodash.d.ts' />
/// <reference path='../../../typings/mongoose/mongoose.d.ts' />
/// <reference path='../../../typings/node/node.d.ts' />
/// <reference path='../../../typings/q/q.d.ts' />
/// <reference path='../../../typings/winston/winston.d.ts' />
<<<<<<< HEAD
import Q        = require('q');
import _        = require('lodash');
=======
>>>>>>> f34c5f9... Adding Angular support for company.
import express  = require('express');
import logger   = require('winston');
import mongoose = require('mongoose');

<<<<<<< HEAD
var nconf    = require('nconf');
var di       = require('di');
var injector = new di.Injector([]);

// TODO
var Company   = mongoose.model('company');
var ERRORPAGE = 'pages/errors/error';
=======
>>>>>>> f34c5f9... Adding Angular support for company.

class CompanyController {
  index = (req:any, res:any, next:Function)=> {
    res.render('pages/companies/index');
  }

  companyHeader(req:any, res:any, next:Function) {
    res.render('pages/companies/header');
  }

  new(req:any, res:any, next:Function) {
    res.render('pages/companies/form');
  }

  edit(req:any, res:any, next:Function) {
    res.render('pages/companies/edit');
  }
//end of class
=======
var express = require('express');
var logger  = require('winston');

class CompanyController {
  index(req:any, res:any, next:Function) {
    res.render('pages/companies/index');
  }

  companyHeader(req:any, res:any, next:Function) {
    res.render('pages/companies/header');
  }

  new(req:any, res:any, next:Function) {
    res.render('pages/companies/form');
  }

  edit(req:any, res:any, next:Function) {
    res.render('pages/companies/edit');
  }
>>>>>>> Stashed changes
}

export=CompanyController;


