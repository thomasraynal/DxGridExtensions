dxGridExtension.controller('customColumns', function customColumnsCrtl($scope, $controller, $timeout, $log, customColumnConfiguration) {

    $scope.management.showCustomColumnConsole = false;

    $scope.customColumnGrid = null;
    $scope.customColumnExpressionText = '';
    $scope.customColumnName = null;
    $scope.customColumnResult = [];
    $scope.customColumnSelectedAvailableColumn = null;
    $scope.customColumnFormating = null;
    $scope.cannotCreateColumn = true;
    $scope.isExistingRuleActionDisabled = true;
    $scope.selectedExistingCustomColumn = null;
    $scope.isExistingCustomColumnActionDisabled = false;

    $scope.$watch('management.showCustomColumnConsole', function() {

        if (!$scope.management.showCustomColumnConsole) return;
        if (!dxGridExtensions.isUndefinedOrNull($scope.customColumnGrid)) $scope.customColumnGrid.dxDataGrid('instance').option('dataSource', null);
        $scope.customColumnExpressionText = '';
        $scope.customColumnName = '';
        $scope.customColumnSelectedAvailableColumn = null;

        dxGridExtensions.resetSelectBoxValue("#customColumnAvailableColumnsFormat");
        dxGridExtensions.resetSelectBoxValue("#existingCustomColumns");

        $scope.selectedExistingCustomColumn = '';
        $scope.customColumnFormating = '';
    });

    $scope.$watch('customColumnExpressionText', function() {
        updateCanCreateColumn();
    });

    $scope.$watch('customColumnName', function() {
        updateCanCreateColumn();
    });

    $scope.$watch('customColumnFormating', function() {
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
            items: "management.columns",
            value: "customColumnSelectedAvailableColumn"
        },
        displayExpr: "dataField",
        onItemClick: function(e) {
            $scope.customColumnExpressionText += '[' + e.itemData.dataField + ']';
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
            value: "customColumnFormating"
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
            visible: "management.showCustomColumnConsole"
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

    $scope.customColumncreateRuleButtonOptions = {
        icon: 'fa fa-hacker-news',
        text: 'Create column',
        bindingOptions: {
            disabled: 'cannotCreateColumn'
        },
        onClick: function(e) {
            $scope.customColumnCreateColumn();
        }
    };

    $scope.customColumndeleteExistingCustomColumnButtonOptions = {
        text: 'Delete',
        bindingOptions: {
            disabled: 'isExistingCustomColumnActionDisabled'
        },
        onClick: function() {
            removeCustomColumn($scope.selectedExistingCustomColumn.name);
            $scope.management.showCustomColumnConsole = false;
        }
    };

    $scope.customColumnloadExistingCustomColumnButtonOptions = {
        text: 'Load',
        bindingOptions: {
            disabled: 'isExistingCustomColumnActionDisabled'
        },
        onClick: function() {
            $scope.customColumnName = $scope.selectedExistingCustomColumn.name;
            $scope.customColumnExpressionText = $scope.selectedExistingCustomColumn.expression;
            $scope.customColumnFormating = $scope.selectedExistingCustomColumn.format;
        }
    };

    $scope.customColumnExistingCustomColumnsSelectBoxOptions = {
        displayExpr: "name",
        bindingOptions: {
            dataSource: 'management.customColumns',
            value: 'selectedExistingCustomColumn'
        },
        placeholder: 'Load existing column...'
    };

    $scope.customColumnCreateColumn = function() {

        applyCustomColumnExpression();

        if (dxGridExtensions.isUndefinedOrNull($scope.management.instance)) return;

        var rule = customColumnConfiguration.createCustomColumn(
            $scope.customColumnName,
            $scope.customColumnExpressionText,
            $scope.customColumnFormating
        );

        var doesColumnExist = _.remove($scope.management.customColumns, { name: rule.name }).length > 0;

        if (doesColumnExist) {
            removeCustomColumn(rule.name);
        }

        $scope.management.customColumns.push(rule)

        customColumnConfiguration.computeCustomColumn(rule, $scope.management.datasource);

        var column = {
            dataField: $scope.customColumnName,
            caption: $scope.customColumnName,
            dataType: $scope.customColumnFormating.dataType,
            format: { type: $scope.customColumnFormating.format.type, precision: $scope.customColumnFormating.format.precision },
            visibleIndex: $scope.management.currentColumn.visibleIndex
        };

        $scope.management.columns.push(column);

        if ($scope.customColumnFormating.dataType === 'number' && $scope.management.groupItems) {

            $scope.management.groupItems.push({
                column: column.dataField,
                summaryType: "sum",
                showInGroupFooter: false,
                alignByColumn: true,
                valueFormat: {
                    type: $scope.customColumnFormating.format.type,
                    precision: $scope.customColumnFormating.format.precision
                },
                displayFormat: "{0}"
            });
        }

        var state = ($scope.management.instance.state) ? $scope.management.instance.state() : undefined;
        if (state) $scope.management.instance.state(state);

        $scope.management.showCustomColumnConsole = false;
    };

    function removeCustomColumn(name) {

        _.remove($scope.management.customColumns, { name: name });

        _.each($scope.management.datasource, function(item) {
            delete item[name];
        });

        _.remove($scope.management.columns, { dataField: name });
        _.remove($scope.management.groupItems, { column: name });

        $scope.management.instance.repaint();
    };

    function updateCanCreateColumn() {
        $scope.cannotCreateColumn = $scope.customColumnFormating == '' || $scope.customColumnExpressionText == '' || dxGridExtensions.isUndefinedOrNull($scope.customColumnName) || dxGridExtensions.isUndefinedOrNull($scope.customColumnFormating);
    };

    function applyCustomColumnExpression() {

        try {

            $scope.customColumnResult = [];

            var expression = $scope.customColumnExpressionText;
            var customColumnExpressionTargetedColumns = expression.match(/\[(.*?)\]/g);

            _.each($scope.management.datasource, function(item) {

                var customColumnResult = {};

                _.each(customColumnExpressionTargetedColumns, function(column) {

                    var sourceColumn = column.substring(1, column.length - 1);

                    if (!item.hasOwnProperty(sourceColumn)) throw new Error("Column " + sourceColumn + " does not exist");

                    customColumnResult[sourceColumn] = item[sourceColumn];

                });

                customColumnResult[$scope.customColumnName] = item[$scope.customColumnName];

                $scope.customColumnResult.push(customColumnResult);

            });

            if (dxGridExtensions.isUndefinedOrNull($scope.customColumnGrid)) return;

            var grid = $scope.customColumnGrid.dxDataGrid('instance');

            customColumnConfiguration.computeCustomColumn({
                name: $scope.customColumnName,
                expression: expression
            }, $scope.customColumnResult);

            grid.columnOption($scope.customColumnName, 'dataType', $scope.customColumnFormating.dataType);

            if ($scope.customColumnFormating.format != null) {

                grid.columnOption($scope.customColumnName, 'format', {
                    type: $scope.customColumnFormating.format.type,
                    precision: $scope.customColumnFormating.format.precision
                });
            }

        } catch (e) {

            $scope.customColumnResult.push({
                error: e.message
            })

            return;

        }
    };
});
