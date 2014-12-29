(function () {
    'use strict';
    angular.module('bussed.map', ['bussed.map.bing', 'bussed.map.location',
                                  'bussed.messages', 'bussed.data.bus',
                                  'bussed.data.common'])

    .directive('bsdMap', ['$log', 'MapObject', function ($log, MapObject) {
        return {
            link: function (scope, elem, attrs) {
                var mapScopeKey = attrs.bsdMap;
                var mapApiKey = attrs.apiKey;
                scope.$watch(mapScopeKey, function (newMap, oldMap) {
                    $log.debug('Map directive changed: {0}'.format(newMap));
                    if (angular.isDefined(newMap)) {
                        newMap.initialize(elem, mapApiKey);
                    }
                });

                var modelKeys = ['stops', 'vehicles'];
                angular.forEach(modelKeys, function (modelKey) {
                    scope.$watch(modelKey, function (newValues) {
                        var map = scope[mapScopeKey];
                        if (!angular.isDefined(newValues) ||
                            !angular.isDefined(map))
                        {
                            return;
                        }
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
                ['$log', '$scope', 'BingMap', 'Messages', 'RealtimeBusInfo',
                 function ($log, $scope, BingMap, Messages, RealtimeBusInfo) {
        $scope.realtimeInfo = new RealtimeBusInfo($scope);
        $scope.map = null;

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
            $log.debug('Platform already ready');
            $scope.map = new BingMap($scope);
            $scope.map.setCurrentPosition();
        }
        else {
            $scope.$on('onReady', function () {
                $log.debug('Platform now ready');
                $scope.map = new BingMap($scope);
                $scope.map.setCurrentPosition();
            });
        }
    }]);
})();