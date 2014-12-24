(function () {
    'use strict';
    angular.module('bussed.map', ['bussed.map.bing', 'bussed.map.location',
                                  'bussed.messages', 'bussed.data.bus',
                                  'bussed.data.common'])

    .directive('bsdMap', ['MapObject', function (MapObject) {
        return {
            link: function (scope, elem, attrs) {
                var map = scope[attrs.bsdMap];
                map.initialize(elem, attrs.apiKey);
                scope.$watch(attrs.bsdMap, function (newMap, oldMap) {
                    if (newMap != oldMap) {
                        newMap.initialize(elem);
                    }
                });

                var modelKeys = ['stops', 'vehicles'];
                angular.forEach(modelKeys, function (modelKey) {
                    scope.$watch(modelKey, function (newValues) {
                        map.clearObjects(modelKey);
                        angular.forEach(newValues, function (value) {
                            var mapObject = new MapObject(
                                value.id, value.position, value.name);
                            if (modelKey === 'stops') {
                                mapObject.icon = '/images/ie/stop.png';
                            }
                            else {
                                mapObject.icon = '/images/bus.png';
                            }
                            map.addObject(modelKey, mapObject);
                        });
                    });
                });
            }
        };
    }])

    .controller('MapController',
                ['$scope', 'BingMap', 'Messages', 'RealtimeBusInfo',
                 function ($scope, BingMap, Messages, RealtimeBusInfo) {
        $scope.realtimeInfo = new RealtimeBusInfo($scope);
        $scope.map = new BingMap($scope);

        var updateWithMap = function (event, map) {
            if ($scope.realtimeInfo) {
                var area = map.getVisibleArea();
                $scope.realtimeInfo.updateStops(area);
                $scope.realtimeInfo.updateVehicles(area);
            }
        };

        $scope.$on('mapinit', updateWithMap);
        $scope.$on('mapchanged', updateWithMap);

        if ($scope.platformData.ready) {
            $scope.map.setCurrentPosition();
        }
        else {
            $scope.$on('onReady', function () {
                $scope.map.setCurrentPosition();
            });
        }
    }]);
})();