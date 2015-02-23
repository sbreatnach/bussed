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
