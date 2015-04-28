/**
 * Check below for path patterns
 * https://github.com/component/path-to-regexp*
 *
 * DOES NOT support nested routing
 */

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
            { name: 'nike', location: 'Tornoto, Canada', logo: '', carrierId: 'nike.maaii.com' }
          ]
        });

        if (env.SERVER) {
          done();
        }
      }, 500);

      // handle state reset
      // seems strange to handle it here
      context.dispatch('RESET_CURRENT_COMPANY', { currentCompany: null });
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'Company' });
      if (env.CLIENT) {
        done();
      }
    }
  },
  /**
   * routeName adminCompany
   * method GET
   * @param {string} carrierId
   * @param {subPage} service|widget
   *
   * Url covered:
   * /admin/companies/:carrierId/settings
   * /admin/companies/:carrierId/settings/service
   * /admin/companies/:carrierId/settings/widget
   */
  adminCompany: {
    path: '/admin/companies/:carrierId/settings/:subPage(service|widget)?',
    method: 'get',
    page: 'company',
    action: function(context, payload, done) {

      // for Fluxible 0.4.x
      //let carrierId = payload.get('params').get('carrierId');
      let carrierId = payload.params.carrierId;

      setTimeout(function() {
        // server-side only function
        // if we are running in client side, companies has to be already existed
        // otherwise, the company list will be empty upon full browser reload
        if (env.SERVER) {
          context.dispatch('LOAD_COMPANIES', {
            companies: [
              { name: 'm800', location: 'Tornoto, Canada', logo: '', carrierId: 'www.m800.com' },
              { name: 'maaii', location: 'Tornoto, Canada', logo: '', carrierId: 'www.maaii.com' },
              { name: 'yato .inc', location: 'Tornoto, Canada', logo: '', carrierId: 'yato.maaii.com' },
              { name: 'adidas', location: 'Tornoto, Canada', logo: '', carrierId: 'adidas.maaii.com' },
              { name: 'nike', location: 'Tornoto, Canada', logo: '', carrierId: 'nike.maaii.com' }
            ]
          });
        }

        context.dispatch('LOAD_COMPANY', {
          company: {
            _id: '001',
            name: 'yato',
            carrierId: carrierId
          }
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
  }
};
