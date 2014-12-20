(function () {
    'use strict';
    angular.module(
        'bussed.main', ['ngRoute', 'bussed.map', 'bussed.messages'],
        ['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/', {
                templateUrl: 'templates/main.tpl.html',
                controller: 'MainController'
            });
        }])

    .controller('MainController', ['$scope', function ($scope) {
    }]);
})();