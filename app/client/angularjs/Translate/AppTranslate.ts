/// <reference path='./../all.ts' />
module whiteLabel{
  export var appTranslate =  angular.module('App.Translate', ['pascalprecht.translate']);
  appTranslate.config(function($translateProvider:pascalprecht.translate.translateProvider){
    $translateProvider.useStaticFilesLoader({
      prefix: '/locales/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
  });
}
