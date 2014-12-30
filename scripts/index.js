(function () {
    'use strict';
    var platformData = {
        ready: false,
        paused: false
    };

    angular.module('bussed', ['ngRoute', 'bussed.main'])
    .config(function ($compileProvider, $logProvider, $routeProvider, $interpolateProvider) {
        // add support for WP8 URLs in Cordova. See https://github.com/angular/angular.js/issues/2303
        $compileProvider.aHrefSanitizationWhitelist(
            /^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0|ms-appdata):/
        );
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
        $routeProvider.otherwise({ redirectTo: '/' });
        // TODO: disable debug logging and symbols for production
        $logProvider.debugEnabled(true);
        $compileProvider.debugInfoEnabled(true);
    })
    .run(function ($log, $rootScope) {
        // on init of Angular, store the platform reference and listen for
        // changes initiated by backend, converting those changes into
        // Angular events
        $log.debug('Running platform hooks');
        $rootScope.platformData = platformData;
        document.addEventListener('deviceready', function () {
            console.log('Device ready');
            $rootScope.$apply(function () {
                $rootScope.platformData.ready = true;
                $rootScope.$broadcast('onReady');
            });
        }, false);
        document.addEventListener('pause', function () {
            console.log('Device paused');
            $rootScope.$apply(function () {
                $rootScope.platformData.paused = true;
                $rootScope.$broadcast('onPause');
            });
        }, false);
        document.addEventListener('resume', function () {
            console.log('Device resumed');
            $rootScope.$apply(function () {
                $rootScope.platformData.paused = false;
                $rootScope.$broadcast('onResume');
            });
        }, false);
    });

    // listening on device ready twice to catch edge case if deviceready is
    // invoked before angular bootstrapped
    document.addEventListener('deviceready', function () {
        console.log('Base device ready');
        platformData.ready = true;
    }, false);
})();