var dxGridExtensionDemo = angular.module('dxGridExtensionDemo', ['dx', 'ngRoute', 'dxGridExtension']);

dxGridExtensionDemo.config(function($routeProvider, $httpProvider, $locationProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'html/view.demo.html',
            controller: 'demo'
        })
        .otherwise({ redirectTo: '/' });

    $locationProvider.hashPrefix('');

});

dxGridExtensionDemo.run(function($rootScope) {
    $rootScope.appTitle = 'DxGridExtensionDemo';
});
