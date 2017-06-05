dxGridExtension.controller('baseGridManagement', function baseGridManagementCrtl($scope, $controller, $attrs) {

    $scope.widget = $scope.$parent;
    $scope.gridName = $attrs.bindto;
    if (!$scope.widget.gridManagement) $scope.widget.gridManagement = {};

    if (!$scope.widget.config) {
        $scope.widget.config = {};
        $scope.widget.config[$attrs.bindto] = {};
    }

    $scope.gridManagement = $scope.widget.gridManagement[$attrs.bindto];
    $scope.config = $scope.widget.config[$attrs.bindto];

    $scope.updateGrid = (action) => {

        $scope.gridInstance.beginUpdate();
        action();
        $scope.gridInstance.endUpdate();
    };

    function updateAvailableColumns() {

        if (dxGridExtensions.isUndefinedOrNull($scope.config.columns)) return;
        $scope.dataSource = $scope.widget[$attrs.datasource];
        $scope.availableColumns = _.sortBy(_.transform($scope.config.columns.concat(null === $scope.config.customColumns ? [] : $scope.config.customColumns), function(result, item) { result.push(item.dataField) }, []), function(e) {
            return e
        });
    };

    $scope.$watch(function() {
        return $scope.widget[$attrs.datasource];
    }, function() {

        $scope.dataSource = $scope.widget[$attrs.datasource];
        updateAvailableColumns()

        $scope.availableColumns = _.sortBy(_.transform($scope.config.columns, function(result, item) { result.push(item.dataField) }, []), function(e) {
            return e
        });
    });

    $scope.$watch(function() {
        return $scope.config.customColumns;
    }, function() {

        updateAvailableColumns()
    });


    $scope.$watch(function() {
        return $scope.config.customColumns.length;
    }, function() {

        updateAvailableColumns()
    });

    $scope.$watch(function() {
        return $scope.widget[$attrs.bindto];
    }, function() {

        $scope.gridInstance = $scope.widget[$attrs.bindto];
    });

    $scope.$watch(function() {
        return $scope.widget.gridManagement[$attrs.bindto].currentColumn;
    }, function() {

        $scope.currentColumn = $scope.widget.gridManagement[$attrs.bindto].currentColumn;
    });


    $scope.$watch(function() {
        return $scope.widget.gridManagement[$attrs.bindto].currentRow;
    }, function() {

        $scope.currentRow = $scope.widget.gridManagement[$attrs.bindto].currentRow;
    });


    var args = { $scope: $scope };

    $controller('columnManagement', args);
    $controller('conditionalFormatting', args);
    $controller('columnChooser', args)
    $controller('customColumns', args)

});
