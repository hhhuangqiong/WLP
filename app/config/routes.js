/**
 * Check below for path patterns
 * https://github.com/component/path-to-regexp*
 *
 * DOES NOT support nested routing
 */
import request from 'superagent';
import debug from 'debug';
import env from '../utils/env';

import showCompanies from '../actions/showCompanies';

const bootstrapDebug = debug('wlp:routes');

export default {
  signin: {
    handler: require('../components/SignIn'),
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
    handler: require('../components/ForgetPass'),
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
    handler: require('../components/About'),
    path: '/about',
    method: 'get',
    page: 'about',
    label: 'About',
    action: function (context, payload, done) {
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'About | flux-examples | routing' });
      done();
    }
  },
  adminOverview: {
    handler: require('../components/Overview'),
    path: '/admin',
    method: 'get',
    page: 'overview',
    action: function(context, payload, done) {
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'overview' });
      done();
    }
  },
  adminCompanies: {
    handler: require('../components/Companies'),
    path: '/admin/companies',
    method: 'get',
    page: 'companies',
    action: function(context, payload, done) {
      context.executeAction(showCompanies, {}, done);

      // handle state reset
      // seems strange to handle it here
      context.dispatch('RESET_CURRENT_COMPANY', { currentCompany: null });
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'company' });
    }
  },
  adminNewCompany: {
    handler: require('../components/Companies'),
    path: '/admin/companies/new',
    method: 'get',
    page: 'company',
    label: 'new company',
    action: function (context, payload, done) {
      context.executeAction(showCompanies, {}, done);
      context.dispatch('NEW_COMPANY');
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'company > create new company' });
      done();
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
    handler: require('../components/Companies'),
    path: '/admin/companies/:carrierId/settings/:subPage(profile|service|widget)?',
    method: 'get',
    page: 'company',
    action: function(context, payload, done) {
      let carrierId = payload.get('params').get('carrierId');
      context.executeAction(showCompanies, { carrierId: carrierId }, done);
      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'company' });
      //if (env.CLIENT) {
      //  done();
      //}
    }
  }
};
