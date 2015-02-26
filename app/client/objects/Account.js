var _    = require('lodash');
var util = require('util');

import BaseObject from './Base'

class Account extends BaseObject {

  constructor($state, $q, ApiService, initData) {
    super($state, $q, ApiService, initData);
    this.methods = {
      accounts: {
        url: "/app/accounts",
        type: "application/json"
      }
    }
  }

  delete() {
    var methods = _.clone(this.methods.accounts);
    methods.url = util.format('%s%s', methods.url, this.data._id);

    this.ApiService.delete(this.methods.accounts, this.data)
      .then((user) => {
        // TBC: how to handle deleted account
      })
      .catch((err) => {
        this.$state.transitionTo('accounts.index.new.fail');
      });
  }

  update() {
    var methods = _.clone(this.methods.accounts);
    methods.url = util.format('%s%s', methods.url, this.data._id);

    this.ApiService.put(methods, this.data)
      .then((user) => {
        this.$state.transitionTo('accounts.index.new.success');
      })
      .catch(function(err) {
        this.$state.transitionTo('accounts.index.new.fail');
      });
  }

  create() {
    this.ApiService.post(this.methods.accounts, this.data)
      .then((data) => {
        if (data.user) {
          this.data = data.user;
          this.$state.transitionTo('accounts.index.new.success');
        } else {
          this.$state.transitionTo('accounts.index.new.fail');
        }
      })
      .catch(function(err) {
        this.$state.transitionTo('accounts.index.new.fail');
      });
  }

  toggleUserGroup(groupName) {
    if (this.data.assignedGroups == undefined) {
      this.data.assignedGroups = [];
    }

    var idx = this.data.assignedGroups.indexOf(groupName);

    if (idx > -1) {
      this.data.assignedGroups.splice(idx, 1);
    } else {
      this.data.assignedGroups.push(groupName);
    }
  }
}

export default Account;
