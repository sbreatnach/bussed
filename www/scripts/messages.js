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
    angular.module('bussed.messages', [])

    .constant('MESSAGE_LEVEL', {
        debug: 'debug',
        info: 'info',
        error: 'error',
        icons: {
            error: '!!',
            info: '??',
            debug: '~~'
        }
    })

    .factory('Message', ['MESSAGE_LEVEL', function (MESSAGE_LEVEL) {
        function Message(title, text, type) {
            this.title = title;
            this.text = text;
            this.type = type || MESSAGE_LEVEL.info;
        }

        Message.prototype.getTypeIcon = function () {
            return MESSAGE_LEVEL.icons[this.type];
        };

        return Message;
    }])

    .service('Messages', ['MESSAGE_LEVEL', 'Message',
                          function (MESSAGE_LEVEL, Message) {
        var obj = this;
        var MESSAGE_LIMIT = 10;
        obj.messages = [];
        obj.addErrorMessage = function (title, text) {
            var newMessage = new Message(title, text, MESSAGE_LEVEL.error);
            var newLength = obj.messages.unshift(newMessage);
            if (newLength > MESSAGE_LIMIT) {
                obj.messages.pop();
            }
        };
    }])

    .controller('MessageController', ['$scope', 'Messages',
                                    function ($scope, Messages) {

        $scope.currentMessages = Messages.messages;

        $scope.expandMessage = function (index) {
            $scope.currentMessages.splice(index, 1);
        };

        $scope.removeAllMessages = function () {
            $scope.currentMessages.splice(0, $scope.currentMessages.length);
        };
    }]);
})();
