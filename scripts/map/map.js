(function () {
    'use strict';
    angular.module('bussed.map', ['bussed.map.bing', 'bussed.map.location',
                                  'bussed.messages', 'bussed.data.bus',
                                  'bussed.data.common'])

    .directive('bsdMap', ['$log', 'Point', 'FileLib', 'MapObject',
                          function ($log, Point, FileLib, MapObject) {
        return {
            link: function (scope, elem, attrs) {
                var mapScopeKey = attrs.bsdMap;
                var mapApiKey = attrs.apiKey;
                scope.$watch(mapScopeKey, function (newMap, oldMap) {
                    $log.debug('Map directive changed: {0}'.format(newMap));
                    if (newMap !== null) {
                        // force the element to the correct height
                        // TODO: screen.height isn't correct for all devices
                        // see http://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html
                        $log.debug('Screen width/height: {0} / {1}'.format(
                            screen.width, screen.height));
                        $log.debug('documentElement.offset: {0} / {1}'.format(
                            document.documentElement.offsetWidth,
                            document.documentElement.offsetHeight));
                        $log.debug('documentElement.client: {0} / {1}'.format(
                            document.documentElement.clientWidth,
                            document.documentElement.clientHeight));
                        $log.debug('window.inner: {0} / {1}'.format(
                            window.innerWidth, window.innerHeight));
                        $log.debug('window.devicePixelRatio: {0}'.format(
                            window.devicePixelRatio || 'unsupported'));
                        elem.height(window.innerHeight);
                        newMap.initialize(elem, mapApiKey);
                    }
                });

                var modelKeys = ['stops', 'vehicles'];
                angular.forEach(modelKeys, function (modelKey) {
                    scope.$watch(modelKey, function (newValues) {
                        var map = scope[mapScopeKey];
                        if (newValues === null || map === null)
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
                                mapObject.width = 33;
                                mapObject.height = 40;
                            }
                            else {
                                path = ['bus.png'];
                                mapObject.width = 16;
                                mapObject.height = 16;
                                mapObject.anchor = new Point(mapObject.width / 2,
                                                             mapObject.height / 2);
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
        $scope.selectedObject = null;
        $scope.stopPredictions = null;

        var updateWithMap = function (event, map) {
            if (map.getZoomLevel() >= 0.7) {
                var area = map.getVisibleArea();
                $scope.realtimeInfo.updateStops(area);
                $scope.realtimeInfo.updateVehiclesRegularly(area);
            }
            else {
                map.clearObjects();
                $scope.realtimeInfo.cancelVehicleUpdate();
                $scope.realtimeInfo.cancelStopUpdate();
                $scope.selectedObject = null;
                $scope.stopPredictions = null;
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

        $scope.setSelectedObject = function (objectKey, object) {
            $scope.selectedObject = $scope[objectKey][object.id];
            $scope.stopPredictions = null;
            if (objectKey === 'stops') {
                $scope.realtimeInfo.updateStopRegularly($scope.selectedObject);
            }
            else {
                $scope.realtimeInfo.cancelStopUpdate();
            }
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