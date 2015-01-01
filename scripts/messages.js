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