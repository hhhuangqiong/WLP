var debug = require('debug')('WhiteLabelPortal:Routes');

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
    page: 'home',
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
  }
};
