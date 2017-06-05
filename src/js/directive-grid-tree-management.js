dxGridExtension.directive('treeGridManagement', function($controller) {
    return {
        restrict: "E",
        scope: {},
        templateUrl: 'view.tree.grid.management.html',
        controller: function($scope, $attrs) {

            $controller('baseGridManagement', { $scope: $scope, $attrs: $attrs });
        }
    };
});
