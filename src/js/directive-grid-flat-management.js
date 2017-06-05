dxGridExtension.directive('flatGridManagement', function($controller) {
    return {
        restrict: "E",
        scope: true,
        templateUrl: 'view.flat.grid.management.html',
        controller: function($scope, $attrs) {

            $controller('baseGridManagement', { $scope: $scope, $attrs: $attrs });

        }
    };
});
