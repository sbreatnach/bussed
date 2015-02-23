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

    angular.module('bussed.map.location', [])

    .factory('Point', function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }

        return Point;
    })
    .factory('GeoPosition', function () {
        function GeoPosition(latitude, longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        return GeoPosition;
    })
    .factory('GeoArea', function () {
        function GeoArea(northWestPosition, southEastPosition) {
            this.northWestPosition = northWestPosition;
            this.southEastPosition = southEastPosition;
        }

        return GeoArea;
    })
    .factory('MapObject', function () {
        function MapObject(id, position, name, icon, width, height, anchor, zIndex, overlayText) {
            this.id = id;
            this.position = position;
            this.name = name;
            this.icon = icon;
            this.width = width;
            this.height = height;
            this.anchor = anchor;
            this.zIndex = zIndex;
            this.overlayText = overlayText;
        }

        return MapObject;
    })

    .service('GeoDefaults', ['GeoPosition', function (GeoPosition) {
        this.position = new GeoPosition(53.363540, -7.835782);
        this.zoomLevel = 0.85;
    }])

    .service('LocationService', ['$q', 'GeoPosition', function ($q, GeoPosition) {

        var obj = this;
        obj.deferred = null;

        obj.onLocationSuccess = function (position) {
            if (obj.deferred !== null) {
                var currentPosition = new GeoPosition(position.coords.latitude,
                                                      position.coords.longitude);
                obj.deferred.resolve(currentPosition);
                obj.deferred = null;
            }
        };

        obj.onLocationError = function (error) {
            if (obj.deferred !== null) {
                obj.deferred.reject(error);
                obj.deferred = null;
            }
        };

        obj.getCurrentPosition = function () {
            if (obj.deferred === null) {
                obj.deferred = $q.defer();
            }
            navigator.geolocation.getCurrentPosition(obj.onLocationSuccess,
                                                     obj.onLocationError);
            return obj.deferred.promise;
        };
    }]);
})();
