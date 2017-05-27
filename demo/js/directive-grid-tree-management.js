dxGridExtensionDemo.directive('treeGridManagement', function($controller) {
    return {
        restrict: "E",
        scope: {},
        templateUrl: 'html/view.tree.grid.management.html',
        controller: function($scope, $attrs) {

            $controller('baseGridManagement', { $scope: $scope, $attrs: $attrs });
        }
    };
});
