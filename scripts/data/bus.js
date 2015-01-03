(function () {
    'use strict';
    angular.module('bussed.data.bus', ['bussed.data.buseireann', 'bussed.messages'])

    .factory('RealtimeBusInfo', ['$interval', 'BusEireann', 'Messages',
                                 function ($interval, BusEireann, Messages) {

        function RealtimeBusInfo(scope) {
            this.scope = scope;
            this.vehicleInterval = null;
            this.stopInterval = null;
        }

        RealtimeBusInfo.prototype.updateStops = function (area) {
            var obj = this;
            BusEireann.getStops(area).then(
                function (data) {
                    obj.scope.stops = data;
                },
                function (error) {
                    Messages.addErrorMessage('Unable to retrieve all stop data', error);
                }
            );
        };

        RealtimeBusInfo.prototype.cancelVehicleUpdate = function () {
            if (this.vehicleInterval) {
                $interval.cancel(this.vehicleInterval);
                this.vehicleInterval = null;
            }
        };

        RealtimeBusInfo.prototype.updateVehicles = function (area) {
            var obj = this;
            BusEireann.getVehicles(area).then(
                function (data) {
                    obj.scope.vehicles = data;
                },
                function (error) {
                    Messages.addErrorMessage('Unable to retrieve latest bus data', error);
                }
            );
        };

        RealtimeBusInfo.prototype.updateVehiclesRegularly = function (area, frequency) {
            var obj = this;
            obj.cancelVehicleUpdate();
            obj.updateVehicles(area);
            obj.vehicleInterval = $interval(function () {
                obj.updateVehicles.apply(obj, [area]);
            }, frequency || 20000);
            obj.scope.$on('$destroy', function () {
                obj.cancelVehicleUpdate();
            });
        };

        RealtimeBusInfo.prototype.cancelStopUpdate = function () {
            if (this.stopInterval) {
                $interval.cancel(this.stopInterval);
                this.stopInterval = null;
            }
        };

        RealtimeBusInfo.prototype.updateStop = function (stop) {
            var obj = this;
            BusEireann.getLatestStopData(stop).then(
                function (data) {
                    obj.scope.stopPredictions = data;
                },
                function (error) {
                    Messages.addErrorMessage('Unable to retrieve latest stop data', error);
                }
            );
        };

        RealtimeBusInfo.prototype.updateStopRegularly = function (stop, frequency) {
            var obj = this;
            obj.cancelStopUpdate();
            obj.updateStop(stop);
            obj.stopInterval = $interval(function () {
                obj.updateStop.apply(obj, [stop]);
            }, frequency || 20000);
            obj.scope.$on('$destroy', function () {
                obj.cancelStopUpdate();
            });
        };

        return RealtimeBusInfo;
    }]);
})();
