dxGridExtension.controller('customColumns', function customColumnsCrtl($scope, $controller, $timeout, $log, customColumnConfiguration) {

    $scope.self.gridManagement.showCustomColumnConsole = false;

    $scope.customColumnGrid = null;
    $scope.customColumnExpressionText = '';
    $scope.customColumnName = null;
    $scope.customColumnResult = [];
    $scope.customColumnSelectedAvailableColumn = null;
    $scope.selectedCustomColumnFormating = null;
    $scope.cannotCreateColumn = true;
    $scope.isExistingRuleActionDisabled = true;
    $scope.selectedExistingCustomColumn = null;
    $scope.isExistingCustomColumnActionDisabled = false;

    if (dxGridExtensions.isUndefinedOrNull($scope.self.config.customColumns)) $scope.self.config.customColumns = [];

    $scope.$watch(function() {
        return $scope.self.gridManagement.showCustomColumnConsole;
    }, function() {

        if (!$scope.self.gridManagement.showCustomColumnConsole) return;
        if (!dxGridExtensions.isUndefinedOrNull($scope.customColumnGrid)) $scope.customColumnGrid.dxDataGrid('instance').option('dataSource', null);
        $scope.customColumnExpressionText = '';
        $scope.customColumnName = '';
        $scope.customColumnSelectedAvailableColumn = null;

        dxGridExtensions.resetSelectBoxValue("#customColumnAvailableColumnsFormat");
        dxGridExtensions.resetSelectBoxValue("#existingCustomColumns");

        $scope.selectedExistingCustomColumn = '';
        $scope.selectedCustomColumnFormating = '';
    });

    $scope.$watch('customColumnExpressionText', function() {
        updateCanCreateColumn();
    });

    $scope.$watch('customColumnName', function() {
        updateCanCreateColumn();
    });

    $scope.$watch('selectedCustomColumnFormating', function() {
        updateCanCreateColumn();
    });

    $scope.$watch('selectedExistingCustomColumn', function() {
        $scope.isExistingCustomColumnActionDisabled = dxGridExtensions.isUndefinedOrNull($scope.selectedExistingCustomColumn) || $scope.selectedExistingCustomColumn == '';
    });

    $scope.customColumnResultGridOptions = {
        bindingOptions: { dataSource: 'customColumnResult' },
        height: 200,
        resize: false,
        onInitialized: function(e) {
            $scope.customColumnGrid = e.element;
        },
        allowColumnResizing: true,
        scrolling: {
            mode: "virtual"
        },
        loadPanel: {
            enabled: true
        },
        hoverStateEnabled: true,
        controlColumnResizing: true,
        showRowLines: true,
        showColumnLines: false,
        selection: {
            mode: "single"
        },
        sorting: {
            mode: "multiple"
        }
    };

    $scope.customColumnAvailableColumnsSelectBoxOptions = {
        bindingOptions: {
            items: "availableColumns",
            value: "customColumnSelectedAvailableColumn"
        },
        onItemClick: function(e) {
            $scope.customColumnExpressionText += '[' + e.itemData + ']';
            $scope.customColumnSelectedAvailableColumn = null;
            dxGridExtensions.resetSelectBoxValue("#customColumnAvailableColumns");
        },
        placeholder: "Add column to expression",
    };

    $scope.customColumnAvailableFormattingSelectBoxOptions = {
        displayExpr: "text",
        valueExpr: "value",
        items: customColumnConfiguration.customColumnFormats,
        bindingOptions: {
            value: "selectedCustomColumnFormating"
        },
        placeholder: "Choose column format",
    };

    $scope.customColumnPopupOptions = {
        width: 900,
        contentTemplate: "info",

        height: "auto",
        dragEnabled: true,
        showTitle: true,
        title: "Management - Custom Columns",
        closeOnOutsideClick: true,
        bindingOptions: {
            visible: "gridManagement.showCustomColumnConsole"
        }
    };

    $scope.customColumnNameTextBoxOptions = {
        bindingOptions: {
            value: "customColumnName"
        },
        placeholder: "Enter column name...",
        showClearButton: true
    };

    $scope.customColumnExpressionTextBoxOptions = {
        bindingOptions: {
            value: "customColumnExpressionText"
        },
        placeholder: "Enter expression...",
        showClearButton: true
    };

    $scope.customColumnTestExpressionButtonOptions = {
        icon: 'fa fa-hacker-news',
        text: 'Test expression',
        bindingOptions: {
            disabled: 'cannotCreateColumn'
        },
        onClick: applyCustomColumnExpression
    };

    $scope.createRuleButtonOptions = {
        icon: 'fa fa-hacker-news',
        text: 'Create column',
        bindingOptions: {
            disabled: 'cannotCreateColumn'
        },

        onClick: function(e) {

            if (dxGridExtensions.isUndefinedOrNull($scope.gridInstance)) return;

            $scope.updateGrid(() => {

                var rule = customColumnConfiguration.createCustomColumn(
                    $scope.customColumnName,
                    $scope.customColumnExpressionText,
                    $scope.selectedCustomColumnFormating
                );

                var doesColumnExist = _.remove($scope.self.config.customColumns, { name: rule.name }).length > 0;

                if (doesColumnExist) {
                    removeCustomColumn(rule.name);
                }

                $scope.self.config.customColumns.push(rule)

                customColumnConfiguration.computeCustomColumn(rule, $scope.dataSource);

                var column = {
                    dataField: $scope.customColumnName,
                    caption: $scope.customColumnName,
                    dataType: $scope.selectedCustomColumnFormating.dataType,
                    format: { type: $scope.selectedCustomColumnFormating.format.type, precision: $scope.selectedCustomColumnFormating.format.precision },
                    visibleIndex: $scope.currentColumn.visibleIndex
                };

                $scope.self.config.columns.push(column);

                if ($scope.selectedCustomColumnFormating.dataType === 'number' && $scope.self.config.groupItems) {

                    $scope.self.config.groupItems.push({
                        column: column.dataField,
                        summaryType: "sum",
                        showInGroupFooter: false,
                        alignByColumn: true,
                        valueFormat: {
                            type: $scope.selectedCustomColumnFormating.format.type,
                            precision: $scope.selectedCustomColumnFormating.format.precision
                        },
                        displayFormat: "{0}"
                    });
                }

            });


            var state = ($scope.gridInstance.state) ? $scope.gridInstance.state() : undefined;
            if (state) $scope.gridInstance.state(state);

            $scope.self.gridManagement.showCustomColumnConsole = false;
        }
    };

    $scope.deleteExistingCustomColumnButtonOptions = {
        text: 'Delete',
        bindingOptions: {
            disabled: 'isExistingCustomColumnActionDisabled'
        },
        onClick: function() {
            removeCustomColumn($scope.selectedExistingCustomColumn.name);
            $scope.self.gridManagement.showCustomColumnConsole = false;
        }
    };

    $scope.loadExistingCustomColumnButtonOptions = {
        text: 'Load',
        bindingOptions: {
            disabled: 'isExistingCustomColumnActionDisabled'
        },
        onClick: function() {
            $scope.customColumnName = $scope.selectedExistingCustomColumn.name;
            $scope.customColumnExpressionText = $scope.selectedExistingCustomColumn.expression;
            $scope.selectedCustomColumnFormating = $scope.selectedExistingCustomColumn.format;
        }
    };

    $scope.existingCustomColumnsSelectBoxOptions = {
        displayExpr: "name",
        bindingOptions: {
            dataSource: 'config.customColumns',
            value: 'selectedExistingCustomColumn'
        },
        placeholder: 'Load existing column...'
    };

    function removeCustomColumn(name) {

        _.remove($scope.self.config.customColumns, { name: name });

        _.each($scope.dataSource, function(item) {
            delete item[name];
        });

        _.remove($scope.self.config.columns, { dataField: name });
        _.remove($scope.self.config.groupItems, { column: name });

        $scope.gridInstance.repaint();
    };

    function updateCanCreateColumn() {
        $scope.cannotCreateColumn = $scope.selectedCustomColumnFormating == '' || $scope.customColumnExpressionText == '' || dxGridExtensions.isUndefinedOrNull($scope.customColumnName) || dxGridExtensions.isUndefinedOrNull($scope.selectedCustomColumnFormating);
    };

    function applyCustomColumnExpression() {

        try {

            if (_.some($scope.self.config.columns, (column) => column.caption === $scope.customColumnName)) throw new Error("Column " + $scope.customColumnName + " already exist");
            if (_.some($scope.self.config.customColumns, (column) => column.caption === $scope.customColumnName)) throw new Error("Column " + $scope.customColumnName + " already exist");


            var expression = $scope.customColumnExpressionText;
            var customColumnExpressionTargetedColumns = expression.match(/\[(.*?)\]/g);

            $scope.customColumnResult = [];

            _.each($scope.dataSource, function(item) {

                var customColumnResult = {};

                _.each(customColumnExpressionTargetedColumns, function(column) {

                    var sourceColumn = column.substring(1, column.length - 1);

                    if (!item.hasOwnProperty(sourceColumn)) throw new Error("Column " + sourceColumn + " does not exist");

                    customColumnResult[sourceColumn] = item[sourceColumn];

                });

                customColumnResult[$scope.customColumnName] = item[$scope.customColumnName];

                $scope.customColumnResult.push(customColumnResult);

            });

            var grid = $scope.customColumnGrid.dxDataGrid('instance');

            customColumnConfiguration.computeCustomColumn({
                name: $scope.customColumnName,
                expression: expression
            }, $scope.customColumnResult);

            //refacto
            $timeout(() => {
                grid.columnOption($scope.customColumnName, 'dataType', $scope.selectedCustomColumnFormating.dataType);

                if ($scope.selectedCustomColumnFormating.format != null) {

                    grid.columnOption($scope.customColumnName, 'format', {
                        type: $scope.selectedCustomColumnFormating.format.type,
                        precision: $scope.selectedCustomColumnFormating.format.precision
                    });
                }

            }, 500);


        } catch (e) {

            $scope.customColumnResult.push({
                error: e.message
            })

            return;

        }
    };
});
