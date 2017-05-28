dxGridExtensionDemo.directive('flatGridManagement', function($controller) {
    return {
        restrict: "E",
        scope: true,
        templateUrl: 'html/view.flat.grid.management.html',
        controller: function($scope, $attrs) {

            $controller('baseGridManagement', { $scope: $scope, $attrs: $attrs });

        }
    };
});
