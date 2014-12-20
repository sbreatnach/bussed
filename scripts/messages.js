(function () {
    'use strict';
    angular.module('bussed.messages', [])

    .service('Messages', function () {
        var obj = this;
        var MESSAGE_LIMIT = 10;
        obj.messages = [];
        obj.addErrorMessage = function (message) {
            var newLength = obj.messages.unshift(message);
            if (newLength > MESSAGE_LIMIT) {
                obj.messages.pop();
            }
        };
    })

    .controller('MessageController', ['$scope', 'Messages',
                                    function ($scope, Messages) {

        $scope.currentMessages = Messages.messages;

        $scope.removeMessage = function (index) {
            $scope.currentMessages.splice(index, 1);
        };
    }]);
})();