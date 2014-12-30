(function () {
    'use strict';
    angular.module('bussed.common', [])

    .constant('MIME_TYPES', {
        urlencoded: 'application/x-www-form-urlencoded'
    })

    .service('HttpLib', function () {
        this.queryStringFromParameters = function (parameters) {
            var urlParameters = [];
            angular.forEach(parameters, function (value, key) {
                if (Array.isArray(value)) {
                    angular.forEach(value, function (subValue) {
                        urlParameters.push([key, encodeURIComponent(subValue)].join('='));
                    });
                }
                else {
                    urlParameters.push([key, encodeURIComponent(value)].join('='));
                }
            });
            return urlParameters.join('&');
        };
    })

    .service('FileLib', function () {
        this.getLocalFilePath = function () {
            var parts;
            if (angular.isDefined(cordova.file) &&
                cordova.file.applicationDirectory !== null) {
                // IOS/Android have the path correctly defined
                parts = [cordova.file.applicationDirectory + 'www'];
            }
            else if (cordova.platformId === 'windowsphone') {
                // WP8 doesn't so must explicitly specify location
                parts = ['x-wmapp0:www'];
            }
            else {
                // running via an emulator or browser
                parts = [''];
            }
            for (var i = 0; i < arguments.length; i += 1) {
                parts.push(arguments[i]);
            }
            return parts.join('/');
        };
    });


    /////////////
    // Additional library functions

    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/\{(\d+)\}/g, function (match, number) {
                return typeof args[number] != 'undefined' ?
                    args[number] : match
                ;
            });
        };
    }
})();