dxGridExtension.controller('columnManagement', function columnManagementCrtl($scope, $controller, $timeout, customColumnConfiguration) {

    $scope.gridManagement.showColumnManagementConsole = false;

    $scope.columnManagementColumnName;
    $scope.columnManagementColumnFormating;
    $scope.cannotValidateChange;

    $scope.columnManagementPopupOptions = {
        width: 350,
        contentTemplate: "info",
        height: "auto",
        dragEnabled: true,
        showTitle: true,
        closeOnOutsideClick: true,
        bindingOptions: {
            visible: "gridManagement.showColumnManagementConsole",
            title: "columnManagementColumnName"
        }
    };

    $scope.$watch(function() {
        return $scope.gridManagement.showColumnManagementConsole;
    }, function() {

        if (dxGridExtensions.isUndefinedOrNull($scope.currentColumn) || !$scope.gridManagement.showColumnManagementConsole) return;

        $scope.columnManagementColumnName = $scope.currentColumn.caption;

        $scope.columnManagementColumnFormating = _.find(customColumnConfiguration.customColumnFormats, function(item) {

            if (item.value.dataType == $scope.currentColumn.dataType) {

                if (!dxGridExtensions.isUndefinedOrNull($scope.currentColumn.format)) {

                    if (dxGridExtensions.isUndefinedOrNull(item.value.format)) return false;

                    if (item.value.format.type == $scope.currentColumn.format.type &&
                        item.value.format.precision == $scope.currentColumn.format.precision) return true;

                } else {
                    if (dxGridExtensions.isUndefinedOrNull(item.value.format)) return true;
                }
            }

            return false;

        });
    });

    $scope.$watch('columnManagementColumnName', function() {
        $scope.cannotValidateChange = ($scope.columnManagementColumnName == '');
    });

    $scope.columnManagementColumnNameTextBoxOptions = {
        bindingOptions: {
            value: "columnManagementColumnName"
        },
        onInput: function(e) {
            $scope.cannotValidateChange = (e.component._options.text == '');
        },
        showClearButton: true
    };

    $scope.columnManagementAvailableFormattingSelectBoxOptions = {
        displayExpr: "text",
        items: customColumnConfiguration.customColumnFormats,
        bindingOptions: {
            value: "columnManagementColumnFormating"
        }
    };

    $scope.columnManagementValidateButtonOptions = {
        text: 'Validate changes',
        bindingOptions: {
            disabled: 'cannotValidateChange'
        },
        onClick: function() {

            $scope.updateGrid(() => {

                    $scope.gridInstance.columnOption($scope.currentColumn.dataField, 'caption', $scope.columnManagementColumnName);
                    $scope.gridInstance.columnOption($scope.currentColumn.dataField, 'dataType', $scope.columnManagementColumnFormating.value.dataType);
                    $scope.gridInstance.columnOption($scope.currentColumn.dataField, 'format', { type: null, precision: null });

                    if (!dxGridExtensions.isUndefinedOrNull($scope.columnManagementColumnFormating.value.format)) {
                        $scope.gridInstance.columnOption($scope.currentColumn.dataField, 'format.type', $scope.columnManagementColumnFormating.value.format.type);
                        $scope.gridInstance.columnOption($scope.currentColumn.dataField, 'format.precision', $scope.columnManagementColumnFormating.value.format.precision);
                    }

                    var groupItem = _.find($scope.groupItems, function(item) {
                        return item.column === $scope.currentColumn.dataField;
                    });

                    if (!dxGridExtensions.isUndefinedOrNull(groupItem)) {

                        if (dxGridExtensions.isUndefinedOrNull($scope.columnManagementColumnFormating.value.format)) {
                            groupItem.valueFormat.type = null;
                            groupItem.valueFormat.precision = null;
                        } else {
                            groupItem.valueFormat.type = $scope.columnManagementColumnFormating.value.format.type;
                            groupItem.valueFormat.precision = $scope.columnManagementColumnFormating.value.format.precision;
                        }

                    }

                    //bindings do not work...
                    $scope.gridInstance.option($scope.currentColumn.dataField, 'summary.groupItems', $scope.config.groupItems);

                });

                $scope.gridManagement.showColumnManagementConsole = false;


        }
    };

});
