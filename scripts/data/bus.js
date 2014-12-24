(function () {
    'use strict';
    angular.module('bussed.data.bus', ['bussed.data.buseireann', 'bussed.messages'])

    .factory('RealtimeBusInfo', ['$interval', 'BusEireann', 'Messages',
                                 function ($interval, BusEireann, Messages) {

        function RealtimeBusInfo(scope) {
            this.scope = scope;
            this.vehicleInterval = null;
        }

        var errorCallback = function (error) {
            Messages.addErrorMessage(error);
        };

        RealtimeBusInfo.prototype.updateStops = function (area) {
            var obj = this;
            BusEireann.getStops(area).then(
                function (data) {
                    obj.scope.stops = data;
                },
                errorCallback
            );
        };

        RealtimeBusInfo.prototype.cancelVehicleUpdate = function () {
            if (this.vehicleInterval) {
                $interval.cancel(this.vehicleInterval);
                this.vehicleInterval = null;
            }
        };

        RealtimeBusInfo.prototype.updateVehicles = function (area, frequency) {
            var obj = this;
            this.cancelVehicleUpdate();
            this.vehicleInterval = $interval(function () {
                BusEireann.getVehicles(area).then(
                    function (data) {
                        obj.scope.vehicles = data;
                    },
                    errorCallback
                );
            }, frequency || 20000);
            this.scope.$on('$destroy', function () {
                this.cancelVehicleUpdate();
            });
        };

        RealtimeBusInfo.prototype.updateCurrentStopData = function (stop) {
            var obj = this;
            BusEireann.getCurrentStopData(stop).then(
                function (data) {
                    obj.scope.currentStop = data;
                },
                errorCallback
            );
        };

        return RealtimeBusInfo;
    }]);
})();
