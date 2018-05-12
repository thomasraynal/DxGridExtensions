dxGridExtension.directive('flatGrid', function() {
    return {
        restrict: "E",
        templateUrl: 'view.grid.flat.html',
        scope: true,
        controller: function($scope, $attrs, $element, $controller) {

            $scope.getDevExpressControl = function() {
                return $scope.$control.find('#flatGrid').dxDataGrid("instance");
            };

            $scope.canGroup = true;

            $controller('baseGridManagement', {
                $scope: $scope,
                attributes: $attrs,
                element: $element,
                parent: $scope.$parent
            });

        }
    };

});
