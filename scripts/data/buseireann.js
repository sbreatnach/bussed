(function () {
    'use strict';
    angular.module('bussed.data.buseireann', ['bussed.common',
                                              'bussed.map.location',
                                              'bussed.data.common'])

    .constant('BUSEIREANN_URLS', {
        vehicles: 'http://bussed.apphb.com/v1/buses',
        stops: 'http://bussed.apphb.com/v1/stops',
        stop: 'http://bussed.apphb.com/v1/stops/{0}/'
        //vehicles: 'http://localhost:50027/v1/buses',
        //stops: 'http://localhost:50027/v1/stops',
        //stop: 'http://localhost:50027/v1/stops/{0}/'
    })

    .service('DataGenerator', ['GeoPosition', 'Stop', 'Bus', 'Route', 'Prediction',
                               function (GeoPosition, Stop, Bus, Route, Prediction) {

        this.stopFromData = function (data) {
            var position = new GeoPosition(data.position.latitude,
                                           data.position.longitude);
            return new Stop(data.id, data.name, position, data.publicId);
        };

        this.busFromData = function (data) {
            var position = new GeoPosition(data.position.latitude,
                                           data.position.longitude);
            var bus = new Bus(data.id, data.name, position, data.direction);
            if (data.route) {
                bus.route = this.routeFromData(data.route);
            }
            return bus;
        };

        this.predictionFromData = function (data) {
            var bus = (data.bus != null) ? this.busFromData(data.bus) : null;
            return new Prediction(data.dueTime, bus);
        };

        this.routeFromData = function (data) {
            return new Route(data.id, data.name, data.directions);
        };
    }])

    .service('BusEireann', ['$log', '$q', '$http', 'HttpLib', 'BUSEIREANN_URLS', 'MIME_TYPES', 'DataGenerator',
                            function ($log, $q, $http, HttpLib, BUSEIREANN_URLS, MIME_TYPES, DataGenerator) {
        var obj = this;
        obj.vehicleRequest = null;
        obj.stopRequest = null;
        obj.stopsRequest = null;
        obj.lastRequestTimestamp = 0;
        obj.routes = {};

        obj.onVehicleSuccess = function (data, status, headers, config) {
            $log.debug('BusEireann::onVehicleSuccess');
            var newData = {};
            angular.forEach(data, function (value) {
                var newBus = DataGenerator.busFromData(value);
                newData[newBus.id] = newBus;
            });
            obj.vehicleRequest.resolve(newData);
            obj.vehicleRequest = null;
        };

        obj.getVehicles = function (area) {
            $log.debug('BusEireann::getVehicles');
            if (obj.vehicleRequest === null) {
                obj.vehicleRequest = $q.defer();
                var qs = HttpLib.queryStringFromParameters({
                    left: area.northWestPosition.longitude,
                    bottom: area.southEastPosition.latitude,
                    top: area.northWestPosition.latitude,
                    right: area.southEastPosition.longitude
                });
                $http.get(
                    BUSEIREANN_URLS.vehicles + '?' + qs
                )
                    .success(obj.onVehicleSuccess)
                    .error(function (data, status, headers, config) {
                        obj.vehicleRequest.reject(
                            'Failed to retrieve latest bus data');
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
                var newStop = DataGenerator.stopFromData(value);
                newData[newStop.id] = newStop;
            });
            obj.stopsRequest.resolve(newData);
            obj.stopsRequest = null;
        };

        obj.getStops = function (area) {
            $log.debug('BusEireann::getStops');
            if (obj.stopsRequest === null) {
                obj.stopsRequest = $q.defer();
                var qs = HttpLib.queryStringFromParameters({
                    left: area.northWestPosition.longitude,
                    bottom: area.southEastPosition.latitude,
                    top: area.northWestPosition.latitude,
                    right: area.southEastPosition.longitude
                });
                $http.get(
                    BUSEIREANN_URLS.stops + '?' + qs
                )
                    .success(obj.onStopsSuccess)
                    .error(function (data, status, headers, config) {
                        obj.stopsRequest.reject(
                            'Failed to retrieve bus stop data');
                        obj.stopsRequest = null;
                    });
            }
            return obj.stopsRequest.promise;
        };

        obj.onStopSuccess = function (data, status, headers, config) {
            $log.debug('BusEireann::onStopSuccess');
            var newData = [];
            angular.forEach(data, function (value) {
                var newPrediction = DataGenerator.predictionFromData(value);
                newData.push(newPrediction);
            });
            obj.stopRequest.resolve(newData);
            obj.stopRequest = null;
        };

        obj.getLatestStopData = function (stop, direction) {
            $log.debug('BusEireann::getLatestStopData');
            if (obj.stopRequest === null) {
                var currentTimestamp = Date.now();
                obj.stopRequest = $q.defer();
                $http.get(
                    BUSEIREANN_URLS.stop.format(stop.id)
                )
                    .success(obj.onStopSuccess)
                    .error(function (data, status, headers, config) {
                        obj.stopRequest.reject(
                            'Failed to retrieve bus stop data');
                        obj.stopRequest = null;
                    });
            }
            return obj.stopRequest.promise;
        };
    }]);
})();