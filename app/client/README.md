Quick notes

General:
- all needed files has to be referenced in client/angularjs/all.ts
- all resources are defined as an Object extending class of BaseObject,
and named as resource name itself in singular e.g. Account, Voucher, User
- each resource object(s) will be passed out into $scope in the corresponding controller,
and that's all controller does
- all objects are injected into AngularJS as a Factory
- an AccountService is defined to handle/store all resources (could be regarded as a kind of controller?)

Sub-modules:
- file named as AppModuleName e.g. AppAccounts
- module named as App.ModuleName e.g. angular.module('App.AppAccounts')
- states and routes should be defined within each sub-module (TBC)
- *** NO LOGIC FLOWS IN SUB_MODULE DECLARATION FILE
- *** Sub-modules MUST BE injected in WhiteLabel.ts e.g. angular.module('App', ['App.AppAcconts'])

ui-router
- Routing and Resolves
https://medium.com/opinionated-angularjs/advanced-routing-and-resolves-a2fcbf874a1c
- Chained Resolve working example
http://plnkr.co/edit/4E1Jy7XCvLRbOSu0muvL?p=preview
- Naming of views in ui-router
https://github.com/angular-ui/ui-router/wiki/Multiple-Named-Views#view-names---relative-vs-absolute-names
