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