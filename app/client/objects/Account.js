import BaseObject from './Base'

class Account extends BaseObject {

  constructor($state, $q, ApiService, initData) {
    super($state, $q, ApiService, initData);
    this.methods = {
      createUser: {
        url: "/app/accounts",
        type: "application/json"
      }
    }
  }

  update() {
    this.ApiService.put('users', this.data)
      .then((user) => {
        this.data._id = user._id;
        this.$state.transitionTo('accounts.index.new.success');
      })
      .catch(function(err) {
        this.$state.transitionTo('accounts.index.new.fail');
      });
  }

  create() {
    this.ApiService.post(this.methods.createUser, this.data)
      .then((data) => {
        if (data.result) {
          this.data._id = data.result._id;
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
