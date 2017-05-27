(function() {
    window.dxGridExtension = {
        isUndefinedOrNull: function(val) {
            return angular.isUndefined(val) || val === null;
        }
    };

    window.dxGridExtension.groupCellTemplate = function(groupCell, info) {
        $('<div>').html(info.text).appendTo(groupCell);
    };

    window.dxGridExtension.isInt = function(n) {
        return !isNaN(Number(n)) && Number(n) % 1 === 0;
    };

    window.dxGridExtension.isFloat = function(n) {
        return !isNaN(Number(n)) && Number(n) % 1 !== 0;
    };


    //https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
    Object.byString = function(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, ''); // strip a leading dot
        var a = s.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in o) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    }
})();

var dxGridExtensionDemo = angular.module('dxGridExtensionDemo', ['dx', 'ngRoute']);

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

    $rootScope.appName = 'DxGridExtensionDemo';



});
