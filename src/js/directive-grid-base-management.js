dxGridExtension.controller('baseGridManagement', function baseGridManagementCrtl($scope, management, datasource, $controller) {


    $scope.management = management;
    $scope.datasource = datasource;

    $scope.availableColumns = [];

    $scope.updateGrid = (action) => {

        $scope.management.instance.beginUpdate();
        action();
        $scope.management.instance.endUpdate();
    };

    function updateAvailableColumns() {
        $scope.availableColumns = _.sortBy(_.transform($scope.management.columns.concat($scope.management.customColumns), function(result, item) { result.push(item.dataField) }, []), function(e) {
            return e
        });
    };

    $scope.$watch(function() {
        return $scope.datasource;
    }, function() {

        updateAvailableColumns();
    });

    $scope.$watch(function() {
        return $scope.management.customColumns;
    }, function() {

        updateAvailableColumns()
    });

    $scope.$watch(function() {
        return $scope.management.customColumns.length;
    }, function() {

        updateAvailableColumns()
    });

    var args = { $scope: $scope };

    $controller('columnManagement', args);
    $controller('conditionalFormatting', args);
    // $controller('columnChooser', args)
    // $controller('customColumns', args)

});
