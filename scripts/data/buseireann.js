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

        var convertLocationToPosition = function (latitude, longitude) {
            return new GeoPosition(latitude / 3600000.0, longitude / 3600000.0);
        };

        this.convertPositionToLocation = function (position) {
            return {
                latitude: Math.round(position.latitude * 3600000.0),
                longitude: Math.round(position.longitude * 3600000.0)
            };
        };

        this.stopFromData = function (data) {
            var position = convertLocationToPosition(data.latitude,
                                                     data.longitude);
            return new Stop(data.id, data.name, position, data.shortName);
        };

        this.busFromData = function (data) {
            var position = convertLocationToPosition(data.latitude,
                                                     data.longitude);
            return new Bus(data.id, data.name, position, data.heading);
        };

        this.predictionFromData = function (data) {
            return new Prediction(data.actualTime, data.vehicleId,
                                  data.routeId);
        };

        this.routeFromData = function (data) {
            return new Route(data.id, data.name, data.directions);
        };
    }])

    .service('BusEireann', ['$log', '$q', '$http', 'BUSEIREANN_URLS', 'MIME_TYPES', 'DataGenerator',
                            function ($log, $q, $http, BUSEIREANN_URLS, MIME_TYPES, DataGenerator) {
        var obj = this;
        var defaultHeaders = {
            'Accept': '*/*',
            'Content-Type': MIME_TYPES.urlencoded
        };
        obj.vehicleRequest = null;
        obj.stopRequest = null;
        obj.stopsRequest = null;
        obj.lastRequestTimestamp = 0;
        obj.routes = {};

        obj.onVehicleSuccess = function (data, status, headers, config) {
            $log.debug('BusEireann::onVehicleSuccess');
            var newData = {};
            angular.forEach(data.vehicles, function (value) {
                if (!angular.isDefined(value.isDeleted) || !value.isDeleted) {
                    newData[value.id] = DataGenerator.busFromData(value);
                }
            });
            obj.vehicleRequest.resolve(newData);
            obj.vehicleRequest = null;
        };

        obj.getVehicles = function (area) {
            $log.debug('BusEireann::getVehicles');
            if (obj.vehicleRequest === null) {
                if (obj.lastRequestTimestamp === 0) {
                    obj.lastRequestTimestamp = Date.now();
                }
                obj.vehicleRequest = $q.defer();
                $http.post(
                    BUSEIREANN_URLS.vehicles,
                    { lastUpdate: obj.lastRequestTimestamp },
                    {
                        headers: defaultHeaders
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
            $log.debug('BusEireann::onStopsSuccess');
            var newData = {};
            angular.forEach(data, function (value) {
                newData[value.id] = DataGenerator.stopFromData(value);
            });
            obj.stopsRequest.resolve(newData);
            obj.stopsRequest = null;
        };

        obj.getStops = function (area) {
            $log.debug('BusEireann::getStops');
            if (obj.stopsRequest === null) {
                obj.stopsRequest = $q.defer();
                var topLeft = DataGenerator.convertPositionToLocation(
                    area.northWestPosition);
                var bottomRight = DataGenerator.convertPositionToLocation(
                    area.southEastPosition);
                $http.post(
                    BUSEIREANN_URLS.stops,
                    {
                        left: topLeft.longitude,
                        bottom: bottomRight.latitude,
                        top: topLeft.latitude,
                        right: bottomRight.longitude
                    },
                    {
                        headers: defaultHeaders
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
            $log.debug('BusEireann::onStopSuccess');
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
            $log.debug('BusEireann::getLatestStopData');
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
                        headers: defaultHeaders
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