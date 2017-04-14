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
    angular.module('bussed.map.bing', ['bussed.map.location'])
    .factory('BingMap', ['$q', 'GeoDefaults', 'GeoPosition', 'GeoArea',
                         function ($q, GeoDefaults, GeoPosition, GeoArea) {

        var MAX_ZOOM_LEVEL = 19;

        function BingMap(scope, position, zoomLevel) {
            this.scope = scope;
            this.position = position || GeoDefaults.position;
            this.zoomLevel = 0;
            this.setZoomLevel(zoomLevel || GeoDefaults.zoomLevel);
            this.map = null;
            this.listenerId = null;
            this.mapObjects = {};
            this.mapEntities = {};
        }

        var createLocationFromPosition = function (position) {
            return new Microsoft.Maps.Location(position.latitude,
                                               position.longitude);
        };

        var createPositionFromLocation = function (location) {
            return new GeoPosition(location.latitude, location.longitude);
        };

        BingMap.prototype.getZoomLevel = function () {
            return Math.round((this.zoomLevel / MAX_ZOOM_LEVEL) * 100) / 100;
        };

        BingMap.prototype.getVisibleArea = function () {
            var bounds = this.map.getBounds();
            var northWestPosition = new GeoPosition(
                bounds.getNorth(), bounds.getWest()
            );
            var southEastPosition = new GeoPosition(
                bounds.getSouth(), bounds.getEast()
            );
            return new GeoArea(northWestPosition, southEastPosition);
        };

        BingMap.prototype.setZoomLevel = function (zoomLevel) {
            if (zoomLevel < 0) {
                zoomLevel = 0;
            }
            else if (zoomLevel > 1.0) {
                zoomLevel = 1.0;
            }
            this.zoomLevel = Math.floor(MAX_ZOOM_LEVEL * zoomLevel);
        };

        BingMap.prototype.clearObjects = function (collectionKey) {
            var obj = this;
            var objectKeys = null;
            var entityKeys = null;
            if (collectionKey) {
                entityKeys = [collectionKey];
                objectKeys = [collectionKey];
            }
            else {
                entityKeys = Object.keys(obj.mapEntities);
                objectKeys = Object.keys(obj.mapObjects);
            }
            angular.forEach(objectKeys, function (key) {
                if (obj.mapObjects[key] === undefined) {
                    return;
                }
                delete obj.mapObjects[key];
            });
            angular.forEach(entityKeys, function (key) {
                if (obj.mapEntities[key] === undefined) {
                    return;
                }
                if (obj.map) {
                    obj.map.entities.remove(obj.mapEntities[key]);
                }
                delete obj.mapEntities[key];
            });
        };

        BingMap.prototype.addObject = function (collectionKey, object) {
            if (this.mapObjects[collectionKey] === undefined) {
                this.mapObjects[collectionKey] = {};
            }
            this.mapObjects[collectionKey][object.id] = object;

            if (this.mapEntities[collectionKey] === undefined) {
                this.mapEntities[collectionKey] =
                    new Microsoft.Maps.EntityCollection();
                if (this.map) {
                    this.map.entities.push(this.mapEntities[collectionKey]);
                }
            }
            var pinOptions = {
                draggable: false,
                width: object.width,
                height: object.height,
                icon: object.icon,
                zIndex: object.zIndex,
                typeName: 'map-pin'
            };
            if (object.overlayText) {
                pinOptions.text = object.overlayText;
            }
            if (object.anchor) {
                pinOptions.anchor = new Microsoft.Maps.Point(object.anchor.x,
                                                             object.anchor.y);
            }
            var pin = new Microsoft.Maps.Pushpin(
                createLocationFromPosition(object.position), pinOptions);
            var obj = this;
            Microsoft.Maps.Events.addHandler(pin, 'click', function (event) {
                obj.onPinClick.apply(obj, [pin, collectionKey, object]);
            });
            this.mapEntities[collectionKey].push(pin);
        };

        BingMap.prototype.onPinClick = function (pin, collectionKey, object) {
            this.setPosition(createPositionFromLocation(pin.getLocation()));
            this.scope.setSelectedObject(collectionKey, object);
        };

        BingMap.prototype.setPosition = function (position) {
            this.position = position;
            if (this.map) {
                this.updateMapPosition();
            }
        };

        BingMap.prototype.updateMapPosition = function () {
            this.map.setView({
                center: createLocationFromPosition(this.position)
            });
        };

        BingMap.prototype.initialize = function (element, apiKey) {
            var mapOptions = {
                credentials: apiKey,
                enableClickableLogo: false,
                showDashboard: false
            };
            var viewOptions = {
                zoom: this.zoomLevel
            };
            if (this.listenerId) {
                Microsoft.Maps.Events.removeHandler(this.listenerId);
            }
            this.map = new Microsoft.Maps.Map(element, mapOptions);
            this.map.setView(viewOptions);
            var obj = this;
            this.listenerId = Microsoft.Maps.Events.addThrottledHandler(
                this.map,
                'viewchangeend', function (e) {
                    obj.zoomLevel = obj.map.getZoom();
                    obj.scope.$emit('mapchanged', obj);
                },
                2000
            );
            this.scope.$emit('mapinit', this);
            if (this.position) {
                this.updateMapPosition();
            }
        };

        return BingMap;
    }]);
})();
