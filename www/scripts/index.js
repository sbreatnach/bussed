/*
 Copyright (c) 2015, Glicsoft
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation and/or
 other materials provided with the distribution.

 3. Neither the name of the copyright holder nor the names of its contributors
 may be used to endorse or promote products derived from this software without
 specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
(function () {
    'use strict';
    var rootApp = 'bussed';
    angular.module(rootApp, ['ngRoute', 'bussed.main'])

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
        $rootScope.platformData = {
            ready: true,
            paused: false,
            online: navigator.connection.type !== Connection.NONE
        };
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
        document.addEventListener('offline', function () {
            console.log('Device offline');
            $rootScope.$apply(function () {
                $rootScope.platformData.online = false;
                $rootScope.$broadcast('onOffline');
            });
        }, false);
        document.addEventListener('online', function () {
            console.log('Device online');
            $rootScope.$apply(function () {
                $rootScope.platformData.online = true;
                $rootScope.$broadcast('onOnline');
            });
        }, false);
    });

    // taken from https://stackoverflow.com/questions/21556090/cordova-angularjs-device-ready
    angular.element(document).ready(function () {
        if (window.cordova) {
            console.log("Running in Cordova, will bootstrap AngularJS once 'deviceready' event fires.");
            document.addEventListener('deviceready', function () {
                console.log("Deviceready event has fired, bootstrapping AngularJS.");
                angular.bootstrap(document.body, [rootApp]);
            }, false);
        } else {
            console.log("Running in browser, bootstrapping AngularJS now.");
            angular.bootstrap(document.body, [rootApp]);
        }
    });
})();
