/// <reference path='./../all.ts' />
var whiteLabel;
(function (whiteLabel) {
    whiteLabel.appTranslate = angular.module('App.Translate', ['pascalprecht.translate']);
    whiteLabel.appTranslate.config(function ($translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: '/locales/',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en');
    });
})(whiteLabel || (whiteLabel = {}));
