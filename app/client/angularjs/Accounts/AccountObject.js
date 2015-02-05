import BaseObject from '../BaseObject'

class Account extends BaseObject {

  constructor($state, $q, ApiService, initData) {
    super($state, $q, ApiService, initData);
  }

  save() {
    if (this.data.id) {
      this.update();
    } else {
      this.create();
    }
  }

  update() {
    this.ApiService.put('users', this.data)
      .then((user: any) => {
        this.data.id = user._id;
        this.$state.transitionTo('accounts.index.new.success');
      })
      .catch(function(err) {
        this.$state.transitionTo('accounts.index.new.fail');
      });
  }

  create() {
    this.ApiService.post('users', this.data)
      .then((data: any) => {
        if (data.result && data.user) {
          this.data.id = data.user._id;
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
