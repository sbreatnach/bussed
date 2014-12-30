﻿(function () {
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
        }

        var createLocationFromPosition = function (position) {
            return new Microsoft.Maps.Location(position.latitude,
                                               position.longitude);
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
            var keys = null;
            if (collectionKey) {
                keys = [collectionKey];
            }
            else {
                keys = Object.keys(obj.mapObjects);
            }
            angular.forEach(keys, function (key) {
                if (obj.mapObjects[key] === undefined) {
                    return;
                }
                if (obj.map) {
                    obj.map.entities.remove(obj.mapObjects[key]);
                }
                delete obj.mapObjects[key];
            });
        };

        BingMap.prototype.addObject = function (collectionKey, object) {
            if (this.mapObjects[collectionKey] === undefined) {
                this.mapObjects[collectionKey] =
                    new Microsoft.Maps.EntityCollection();
                if (this.map) {
                    this.map.entities.push(this.mapObjects[collectionKey]);
                }
            }
            var pinOptions = {
                draggable: false,
                width: object.width,
                height: object.height,
                icon: object.icon
            };
            if (object.name) {
                pinOptions.text = object.name;
            }
            if (object.anchor) {
                pinOptions.anchor = new Microsoft.Maps.Point(object.x,
                                                             object.y);
            }
            var pin = new Microsoft.Maps.Pushpin(
                createLocationFromPosition(object.position), pinOptions);
            this.mapObjects[collectionKey].push(pin);
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
                enableSearchLogo: false,
                showDashboard: false,
                zoom: this.zoomLevel
            };
            if (this.listenerId) {
                Microsoft.Maps.Events.removeHandler(this.listenerId);
            }
            this.map = new Microsoft.Maps.Map(element[0], mapOptions);
            var obj = this;
            this.listenerId = Microsoft.Maps.Events.addThrottledHandler(
                this.map,
                'viewchangeend', function (e) {
                    obj.zoomLevel = obj.map.getTargetZoom();
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