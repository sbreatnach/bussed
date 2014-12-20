(function () {
    'use strict';
    angular.module('bussed.data.buseireann', ['bussed.common',
                                              'bussed.map.location',
                                              'bussed.data.common'])

    .constant('BUSEIREANN_URLS', {
        vehicles: 'http://whensmybus.buseireann.ie/internetservice/geoserviceDispatcher/services/vehicleinfo/vehicles',
        stops: 'http://whensmybus.buseireann.ie/internetservice/geoserviceDispatcher/services/stopinfo/stops',
        stop: 'http://whensmybus.buseireann.ie/internetservice/services/passageinfo/stopPassages/stop'
    })

    .service('DataGenerator', ['GeoPosition', 'Stop', 'Bus', 'Route', 'Prediction',
                               function (GeoPosition, Stop, Bus, Route, Prediction) {
        this.stopFromData = function (data) {
            return new Stop(data.id, data.name, data.latitude, data.longitude,
                            data.shortName);
        };

        this.busFromData = function (data) {
            return new Bus(data.id, data.name,
                           new GeoPosition(data.latitude, data.longitude),
                           data.heading);
        };

        this.predictionFromData = function (data) {
            return new Prediction(data.actualTime, data.vehicleId,
                                  data.routeId);
        };

        this.routeFromData = function (data) {
            return new Route(data.id, data.name, data.directions);
        };
    }])

    .service('BusEireann', ['$q', '$http', 'BUSEIREANN_URLS', 'MIME_TYPES', 'DataGenerator',
                            function ($q, $http, BUSEIREANN_URLS, MIME_TYPES, DataGenerator) {
        var obj = this;
        obj.vehicleRequest = null;
        obj.stopRequest = null;
        obj.stopsRequest = null;
        obj.lastRequestTimestamp = 0;
        obj.routes = {};

        obj.onVehicleSuccess = function (data, status, headers, config) {
            var newData = {};
            angular.forEach(data, function (value) {
                if (!angular.isDefined(value.isDeleted) || !value.isDeleted) {
                    newData[value.id] = DataGenerator.busFromData(value);
                }
            });
            obj.vehicleRequest.resolve(newData);
            obj.vehicleRequest = null;
        };

        obj.getVehicles = function (area) {
            if (obj.vehicleRequest === null) {
                if (obj.lastRequestTimestamp === 0) {
                    obj.lastRequestTimestamp = Date.now();
                }
                obj.vehicleRequest = $q.defer();
                $http.post(
                    BUSEIREANN_URLS.vehicles,
                    { lastUpdate: obj.lastRequestTimestamp },
                    {
                        headers: {
                            'Accept': '*/*',
                            'Content-Type': MIME_TYPES.urlencoded
                        }
                    }
                )
                    .success(obj.onVehicleSuccess)
                    .error(function (data, status, headers, config) {
                        obj.vehicleRequest.reject(
                            'Failed to retrieve latest bus data from Bus Eireann');
                        obj.vehicleRequest = null;
                    });
                obj.lastRequestTimestamp = Date.now();
            }
            return obj.vehicleRequest.promise;
        };

        obj.onStopsSuccess = function (data, status, headers, config) {
            var newData = {};
            angular.forEach(data, function (value) {
                newData[value.id] = DataGenerator.stopFromData(value);
            });
            obj.stopsRequest.resolve(newData);
            obj.stopsRequest = null;
        };

        obj.getStops = function (area) {
            if (obj.stopsRequest === null) {
                obj.stopsRequest = $q.defer();
                $http.post(
                    BUSEIREANN_URLS.stops,
                    {
                        left: area.northWestPosition.longitude,
                        bottom: area.southEastPosition.latitude,
                        top: area.northWestPosition.latitude,
                        right: area.southEastPosition.longitude
                    },
                    {
                        headers: { 'Content-Type': MIME_TYPES.urlencoded }
                    }
                )
                    .success(obj.onStopsSuccess)
                    .error(function (data, status, headers, config) {
                        obj.stopsRequest.reject(
                            'Failed to retrieve bus stop data from Bus Eireann');
                        obj.stopsRequest = null;
                    });
            }
            return obj.stopsRequest.promise;
        };

        obj.onStopSuccess = function (data, status, headers, config) {
            var newData = { routes: {}, predictions: [] };
            angular.forEach(data.actual, function (value) {
                newData.predictions.push(
                    DataGenerator.predictionFromData(value)
                );
            });
            angular.forEach(data.routes, function (value) {
                newData.routes[value.id] = DataGenerator.routeFromData(value);
            });
            obj.stopRequest.resolve(newData);
            obj.stopRequest = null;
        };

        obj.getLatestStopData = function (stop, direction) {
            if (obj.stopRequest === null) {
                var currentTimestamp = Date.now();
                obj.stopRequest = $q.defer();
                $http.post(
                    BUSEIREANN_URLS.stop,
                    {
                        stop: stop.publicId,
                        mode: direction || 'departure',
                        startTime: currentTimestamp,
                        // unsure what this does but it's always in the future
                        // on site so do the same. possible time in future to
                        // limit the responses?
                        cacheBuster: currentTimestamp + 60000
                    },
                    {
                        headers: { 'Content-Type': MIME_TYPES.urlencoded }
                    }
                )
                    .success(obj.onStopSuccess)
                    .error(function (data, status, headers, config) {
                        obj.stopRequest.reject(
                            'Failed to retrieve bus stop data from Bus Eireann');
                        obj.stopRequest = null;
                    });
            }
            return obj.stopRequest.promise;
        };
    }]);
})();