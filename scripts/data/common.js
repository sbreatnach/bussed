(function () {
    'use strict';
    angular.module('bussed.data.common', [])

    .factory('Stop', function () {
        function Stop(id, name, position, publicId) {
            this.id = id;
            this.name = name;
            this.position = position;
            this.publicId = publicId;
        }

        return Stop;
    })

    .factory('Bus', function () {
        function Bus(id, name, position, direction) {
            this.id = id;
            this.name = name;
            this.position = position;
            this.direction = direction;
        }

        return Bus;
    })

    .factory('Route', function () {
        function Route(id, name, endpoints) {
            this.id = id;
            this.name = name;
            this.endpoints = endpoints;
        }

        return Route;
    })

    .factory('Prediction', function () {
        function Prediction(expectedTime, busId, routeId) {
            this.expectedTime = expectedTime;
            this.busId = busId;
            this.routeId = routeId;
        }

        return Prediction;
    });
})();