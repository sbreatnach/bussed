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
                        // HACK: to workaround Bing maps not loading fully
                        // despite using correct callbacks
                        var interval = setInterval(function(){
                            try {
                                newMap.initialize(elem[0], mapApiKey);
                                clearInterval(interval);
                            } catch(e) {
                            }
                        }, 100);
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
                                value.id, value.position);
                            var path;
                            if (modelKey === 'stops') {
                                path = ['stop.png'];
                                mapObject.width = 33;
                                mapObject.height = 40;
                                mapObject.zIndex = 4;
                                mapObject.overlayText = 'STOP';
                            }
                            else {
                                path = ['bus.png'];
                                mapObject.zIndex = 5;
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
        $scope.selectedStop = null;
        $scope.stopPredictions = null;
        $scope.currentArea = null;

        var updateWithMap = function (event, map) {
            if (map.getZoomLevel() >= 0.7) {
                var area = map.getVisibleArea();
                $scope.currentArea = area;
                $scope.realtimeInfo.updateStops($scope.currentArea);
                $scope.realtimeInfo.updateVehiclesRegularly($scope.currentArea);
            }
            else {
                map.clearObjects();
                $scope.realtimeInfo.cancelVehicleUpdate();
                $scope.realtimeInfo.cancelStopUpdate();
                $scope.selectedObject = null;
                $scope.selectedStop = null;
                $scope.stopPredictions = null;
                $scope.currentArea = null;
            }
        };

        var pauseUpdates = function (event) {
            $scope.realtimeInfo.cancelVehicleUpdate();
            $scope.realtimeInfo.cancelStopUpdate();
        };

        var resumeUpdates = function (event) {
            if ($scope.selectedStop) {
                $scope.realtimeInfo.updateStopRegularly($scope.selectedStop);
            }
            if ($scope.currentArea) {
                $scope.realtimeInfo.updateVehiclesRegularly($scope.currentArea);
            }
        };

        var online = function (event) {
            // TODO: clear offline notifications, if any
            resumeUpdates();
        };

        var offline = function (event) {
            // TODO: add notification that device is offline
            pauseUpdates();
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
                $scope.selectedStop = $scope.selectedObject;
                $scope.realtimeInfo.updateStopRegularly($scope.selectedStop);
            }
            else {
                $scope.selectedStop = null;
                $scope.realtimeInfo.cancelStopUpdate();
            }
        };

        $scope.$on('mapinit', updateWithMap);
        $scope.$on('mapchanged', updateWithMap);
        $scope.$on('onPause', pauseUpdates);
        $scope.$on('onResume', resumeUpdates);
        $scope.$on('onOnline', online);
        $scope.$on('onOffline', offline);

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
