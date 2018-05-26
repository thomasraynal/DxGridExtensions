dxGridExtension.controller('columnManagement', function columnManagementCrtl($scope, $controller, $timeout, customColumnConfiguration) {

    $scope.management.showColumnManagementConsole = false;
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
            visible: "management.showColumnManagementConsole",
            title: "columnManagementColumnName"
        }
    };

    $scope.$watch('management.showColumnManagementConsole', function() {

        if (dxGridExtensions.isUndefinedOrNull($scope.management.currentColumn) || !$scope.management.showColumnManagementConsole) return;

        $scope.columnManagementColumnName = $scope.management.currentColumn.caption;

        $scope.columnManagementColumnFormating = _.find(customColumnConfiguration.customColumnFormats, function(item) {

            if (item.value.dataType == $scope.management.currentColumn.dataType) {

                if (!dxGridExtensions.isUndefinedOrNull($scope.management.currentColumn.format)) {

                    if (dxGridExtensions.isUndefinedOrNull(item.value.format)) return false;

                    if (item.value.format.type == $scope.management.currentColumn.format.type &&
                        item.value.format.precision == $scope.management.currentColumn.format.precision) return true;

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
            $scope.columnManagementValidate();
        }
    };

    $scope.columnManagementValidate = function() {

        $scope.safeUpdate(() => {

            $scope.management.instance.columnOption($scope.management.currentColumn.dataField, 'caption', $scope.columnManagementColumnName);
            $scope.management.instance.columnOption($scope.management.currentColumn.dataField, 'dataType', $scope.columnManagementColumnFormating.value.dataType);
            $scope.management.instance.columnOption($scope.management.currentColumn.dataField, 'format', { type: null, precision: null });

            if (!dxGridExtensions.isUndefinedOrNull($scope.columnManagementColumnFormating.value.format)) {
                $scope.management.instance.columnOption($scope.management.currentColumn.dataField, 'format.type', $scope.columnManagementColumnFormating.value.format.type);
                $scope.management.instance.columnOption($scope.management.currentColumn.dataField, 'format.precision', $scope.columnManagementColumnFormating.value.format.precision);
            }

            var groupItem = _.find($scope.management.groupItems, function(item) {
                return item.column === $scope.management.currentColumn.dataField;
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
        });

        $scope.management.showColumnManagementConsole = false;
    };

});
