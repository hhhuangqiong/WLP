/**
 * Check below for path patterns
 * https://github.com/component/path-to-regexp*
 *
 * DOES NOT support nested routing
 */
import request from 'superagent';
import debug from 'debug';
import env from '../utils/env';

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
  dynamicpage: {
    handler: require('../components/Page'),
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
      // doing this will disable the server rendering ability
      request
        .get('http://localhost:3000/companies')
        .send({
          includeWL: true
        })
        .set('Accept', 'application/json')
        .end(function(err, res){
          context.dispatch('LOAD_COMPANIES', {
            companies: res.body.result
          });

          if (env.SERVER) {
            done();
          }
        });

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

      request
        .get(`http://localhost:3000/companies/company/${carrierId}`)
        .set('Accept', 'application/json')
        .end(function(err, res){
          // server-side only function
          // if we are running in client side, companies has to be already existed
          // otherwise, the company list will be empty upon full browser reload
          //if (env.SERVER) {
          //  context.dispatch('LOAD_COMPANIES', {
          //    companies: [
          //      { name: 'm800', location: 'Tornoto, Canada', logo: '', carrierId: 'www.m800.com' },
          //      { name: 'maaii', location: 'Tornoto, Canada', logo: '', carrierId: 'www.maaii.com' },
          //      { name: 'yato .inc', location: 'Tornoto, Canada', logo: '', carrierId: 'yato.maaii.com' },
          //      { name: 'adidas', location: 'Tornoto, Canada', logo: '', carrierId: 'adidas.maaii.com' },
          //      { name: 'nike', location: 'Tornoto, Canada', logo: '', carrierId: 'nike.maaii.com' }
          //    ]
          //  });
          //}

          context.dispatch('LOAD_COMPANY', {
            company: res.body.company
          });

          if (env.SERVER) {
            done();
          }
        });

      context.dispatch('UPDATE_PAGE_TITLE', { pageTitle: 'Company' });
      if (env.CLIENT) {
        done();
      }
    }
  }
};
