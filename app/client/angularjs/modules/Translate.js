var translateModule =  angular.module('App.Translate', ['pascalprecht.translate']);

translateModule.config(function($translateProvider) {
  $translateProvider.useStaticFilesLoader({
    prefix: '/locales/',
    suffix: '.json'
  });
  $translateProvider.preferredLanguage('en');
});

export default translateModule
