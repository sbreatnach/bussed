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
