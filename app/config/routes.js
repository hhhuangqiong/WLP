var debug = require('debug')('WhiteLabelPortal:Routes');

import env from 'app/utils/env';

export default {
  signin: {
    path: '/signin',
    method: 'get',
    page: 'signin',
    label: 'Sign In',
    action: function (context, payload, done) {
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'Sign In | flux-examples | routing' });
      done();
    }
  },
  forgot: {
    path: '/forgot',
    method: 'get',
    page: 'forgot',
    label: 'forgot password',
    action: function (context, payload, done) {
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'Forgot | flux-examples | routing' });
      done();
    }
  },
  about: {
    path: '/about',
    method: 'get',
    page: 'about',
    label: 'About',
    action: function (context, payload, done) {
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'About | flux-examples | routing' });
      done();
    }
  },
  dynamicpage: {
    path: '/page/:id',
    method: 'get',
    page: 'page',
    action: function (context, payload, done) {
      // imitating async request here
      setTimeout(function() {
        context.dispatch('LOAD_PAGE', { id: payload.params.id, contents: 'i am a good boy' });
      }, 5000);
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: payload.params.id + ' [Dynamic Page] | flux-examples | routing' });
      done();
    }
  },
  adminOverview: {
    path: '/admin',
    method: 'get',
    page: 'overview',
    action: function(context, payload, done) {
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'Overview' });
      done();
    }
  },
  adminCompanies: {
    path: '/admin/companies',
    method: 'get',
    page: 'companies',
    action: function(context, payload, done) {
      setTimeout(function() {
        context.dispatch('LOAD_COMPANIES', {
          companies: [
            { name: 'm800', location: 'Tornoto, Canada', logo: '', carrierId: 'www.m800.com' },
            { name: 'maaii', location: 'Tornoto, Canada', logo: '', carrierId: 'www.maaii.com' },
            { name: 'yato .inc', location: 'Tornoto, Canada', logo: '', carrierId: 'yato.maaii.com' },
            { name: 'adidas', location: 'Tornoto, Canada', logo: '', carrierId: 'adidas.maaii.com' },
            { name: 'nike', location: 'Tornoto, Canada', logo: '', carrierId: 'nike.maaii.com' },
          ]
        });

        if (env.SERVER) {
          done();
        }
      }, 500);

      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'Company' });
      if (env.CLIENT) {
        done();
      }
    }
  },
  adminCompany: {
    path: '/admin/companies/:carrierId',
    method: 'get',
    page: 'companies',
    action: function(context, payload, done) {
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'CompanyName' });
      done();
    }
  }
};
