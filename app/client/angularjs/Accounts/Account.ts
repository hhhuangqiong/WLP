/// <reference path='./../all.ts' />

module whitelabel {
  export class Account extends BaseObject {

    constructor($state: ng.ui.IStateService, $q: ng.IQService, ApiService: ApiService, initData: any) {
      super($state, $q, ApiService, initData);
    }

    /**
     * save an Account Object
     */
    save = () => {
      if (this.data.id) {
        this.update();
      } else {
        this.create();
      }
    };

    update = () => {
      this.ApiService.put('users', this.data)
        .then((user: any) => {
          this.data.id = user._id;
          this.$state.transitionTo('accounts.index.new.success');
        })
        .catch(function(err) {
          this.$state.transitionTo('accounts.index.new.fail');
        });
    };

    create = () => {
      this.ApiService.post('users', this.data)
        .then((user: any) => {
          this.data.id = user._id;
          this.$state.transitionTo('accounts.index.new.success');
        })
        .catch(function(err) {
          this.$state.transitionTo('accounts.index.new.fail');
        });
    };

    toggleUserGroup = (groupName: string) => {

      if (this.data.assignedGroups == undefined) {
        this.data.assignedGroups = [];
      }

      var idx = this.data.assignedGroups.indexOf(groupName);

      if (idx > -1) {
        this.data.assignedGroups.splice(idx, 1);
      } else {
        this.data.assignedGroups.push(groupName);
      }
    };
  }

  app.factory('Account', function() {
    return Account;
  })
}
