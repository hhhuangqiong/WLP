import _ from 'lodash';
import authority from '../main/authority/checker';

module.exports = {
  name: 'AuthorityPlugin',

  plugContext: function(options) {
    return {
      plugComponentContext: function(componentContext) {
        componentContext.getAuthority = function() {
          return authority;
        }
      }
    }
  }
}
