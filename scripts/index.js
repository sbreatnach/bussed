﻿(function () {
    'use strict';
    // global platform data to act as bridge between Angular and platform
    // backend.
    var platformData = {
        ready: false,
        paused: false
    };

    angular.module('bussed', ['ngRoute', 'bussed.main'])
    .config(function ($compileProvider, $logProvider, $routeProvider, $interpolateProvider) {
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
        $rootScope.$watch('platformData.ready', function (newData, oldData) {
            $rootScope.$broadcast('onReady');
        });
        $rootScope.$watch('platformData.paused', function (newData, oldData) {
            if (newData) {
                $rootScope.$broadcast('onPause');
            }
            else {
                $rootScope.$broadcast('onResume');
            }
        });
    });

    document.addEventListener('deviceready', function () {
        console.log('Device ready');
        platformData.ready = true;
    }, false);

    document.addEventListener('pause', function () {
        console.log('Device paused');
        platformData.paused = true;
    }, false);

    document.addEventListener('resume', function () {
        console.log('Device resuming');
        platformData.paused = false;
    }, false);
})();