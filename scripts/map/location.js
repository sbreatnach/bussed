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
        function MapObject(id, position, name, icon, width, height, anchor, zIndex) {
            this.id = id;
            this.position = position;
            this.name = name;
            this.icon = icon;
            this.width = width;
            this.height = height;
            this.anchor = anchor;
            this.zIndex = zIndex;
        }

        return MapObject;
    })

    .service('GeoDefaults', ['GeoPosition', function (GeoPosition) {
        this.position = new GeoPosition(53.363540, -7.835782);
        this.zoomLevel = 0.5;
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