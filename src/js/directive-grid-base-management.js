dxGridExtension.controller('baseGridManagement', function baseGridManagementCrtl($scope, $controller, $attrs) {

    $scope.self = $scope.$parent;
    $scope.gridName = $attrs.instance;
    if (!$scope.self.gridManagement) $scope.self.gridManagement = {};

    if (!$scope.self.config) {
        $scope.self.config = {};
        $scope.self.config[$attrs.instance] = {};
    }

    $scope.self.gridManagement[$attrs.instance];
    $scope.self.config[$attrs.instance];

    $scope.updateGrid = (action) => {

        $scope.gridInstance.beginUpdate();
        action();
        $scope.gridInstance.endUpdate();
    };

    function updateAvailableColumns() {

        if (dxGridExtensions.isUndefinedOrNull($scope.self.config.columns)) return;
        $scope.dataSource = $scope.self[$attrs.datasource];
        $scope.availableColumns = _.sortBy(_.transform($scope.self.config.columns.concat(null === $scope.self.config.customColumns ? [] : $scope.self.config.customColumns), function(result, item) { result.push(item.dataField) }, []), function(e) {
            return e
        });
    };

    $scope.$watch(function() {
        return $scope.self[$attrs.datasource];
    }, function() {

        $scope.dataSource = $scope.self[$attrs.datasource];
        updateAvailableColumns()

        $scope.availableColumns = _.sortBy(_.transform($scope.self.config.columns, function(result, item) { result.push(item.dataField) }, []), function(e) {
            return e
        });
    });

    $scope.$watch(function() {
        return $scope.self.config.customColumns;
    }, function() {

        updateAvailableColumns()
    });

    $scope.$watch(function() {
        return $scope.self.config.customColumns.length;
    }, function() {

        updateAvailableColumns()
    });

    $scope.$watch(function() {
        return $scope.self[$attrs.instance];
    }, function() {

        $scope.gridInstance = $scope.self[$attrs.instance];
    });

    $scope.$watch(function() {
        return $scope.self.gridManagement[$attrs.instance].currentColumn;
    }, function() {

        $scope.currentColumn = $scope.self.gridManagement[$attrs.instance].currentColumn;
    });


    $scope.$watch(function() {
        return $scope.self.gridManagement[$attrs.instance].currentRow;
    }, function() {

        $scope.currentRow = $scope.self.gridManagement[$attrs.instance].currentRow;
    });


    var args = { $scope: $scope, management: $scope.self.gridManagement[$attrs.instance], config: $scope.self.config[$attrs.instance] };

    $controller('columnManagement', args);
    $controller('conditionalFormatting', args);
    $controller('columnChooser', args)
    $controller('customColumns', args)

});
