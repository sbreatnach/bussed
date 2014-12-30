(function () {
    'use strict';
    angular.module('bussed.map', ['bussed.map.bing', 'bussed.map.location',
                                  'bussed.messages', 'bussed.data.bus',
                                  'bussed.data.common'])

    .directive('bsdMap', ['$log', 'FileLib', 'MapObject', function ($log, FileLib, MapObject) {
        return {
            link: function (scope, elem, attrs) {
                var mapScopeKey = attrs.bsdMap;
                var mapApiKey = attrs.apiKey;
                scope.$watch(mapScopeKey, function (newMap, oldMap) {
                    $log.debug('Map directive changed: {0}'.format(newMap));
                    if (newMap !== null) {
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
                            var path;
                            if (modelKey === 'stops') {
                                path = ['ie', 'stop.png'];
                            }
                            else {
                                path = ['bus.png'];
                            }
                            path.splice(0, 0, 'images');
                            mapObject.icon = FileLib.getLocalFilePath.apply(
                                null, path);
                            map.addObject(modelKey, mapObject);
                        });
                    });
                });
            }
        };
    }])

    .controller('MapController',
                ['$log', '$scope', 'BingMap', 'Messages', 'RealtimeBusInfo', 'LocationService',
                 function ($log, $scope, BingMap, Messages, RealtimeBusInfo, LocationService) {
        $scope.realtimeInfo = new RealtimeBusInfo($scope);
        $scope.map = null;

        var updateWithMap = function (event, map) {
            if (map.getZoomLevel() >= 0.7) {
                var area = map.getVisibleArea();
                $scope.realtimeInfo.updateStops(area);
                $scope.realtimeInfo.updateVehicles(area);
            }
            else {
                map.clearObjects();
            }
        };

        $scope.setCurrentPosition = function () {
            LocationService.getCurrentPosition().then(
                function (position) {
                    if ($scope.map !== null) {
                        $scope.map.setPosition(position);
                    }
                },
                function (errorMessage) {
                    Messages.addMessage(errorMessage);
                }
            );
        };

        $scope.$on('mapinit', updateWithMap);
        $scope.$on('mapchanged', updateWithMap);

        if ($scope.platformData.ready) {
            $log.debug('Platform already ready');
            $scope.map = new BingMap($scope);
            $scope.setCurrentPosition();
        }
        else {
            $scope.$on('onReady', function () {
                $log.debug('Platform now ready');
                $scope.map = new BingMap($scope);
                $scope.setCurrentPosition();
            });
        }
    }]);
})();