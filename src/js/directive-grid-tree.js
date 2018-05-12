dxGridExtension.directive('treeGrid', function() {
    return {
        restrict: "E",
        templateUrl: 'view.grid.tree.html',
        scope: true,
        controller: function($scope, $attrs, $element, $controller) {

            $scope.getDevExpressControl= function() {
                return $scope.$control.find('#treeGrid').dxTreeList("instance");
            };

            $scope.canGroup = false;

            $controller('baseGridManagement', {
                $scope: $scope,
                attributes: $attrs,
                element: $element,
                parent: $scope.$parent
            });
        }

    };

});
