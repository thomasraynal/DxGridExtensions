dxGridExtension.controller('conditionalFormatting', function conditionalFormattingCrtl($scope, $controller, $timeout, conditionalFormattingConfiguration) {

    const defaultColor = "#ff2600";
    const defaultIcon = conditionalFormattingConfiguration.availableIcons[0];

    $scope.gridManagement.showConditionalFormattingConsole = false;

    $scope.conditionalFormatingGrid = null;
    $scope.conditionalFormattingResult = [];
    $scope.conditionalFormatingExpressionText = '';
    $scope.isExpressionDisabled = true;
    $scope.isCreateRuleDisabled = true;
    $scope.conditionalFormattingExpressionTargetedColumns = [];
    $scope.selectedExistingConditionalFormattingRule = null;

    $scope.conditionalFormatingTargetColumn = null;
    $scope.selectedConditionalFormattingRule = null;
    $scope.selectedConditionalFormattingRules = [];
    $scope.currentConditionalFormattingColor = defaultColor;
    $scope.selectedConditionalFormattingIcon = defaultIcon;

    $scope.config.conditionalFormattingRules = !dxGridExtensions.isUndefinedOrNull($scope.config.conditionalFormattingRules) ? _.transform($scope.config.conditionalFormattingRules, function(result, item) {
        result.push(conditionalFormattingConfiguration.getRuleFromdescriptor(item))
    }, []) : [];


    $scope.$watch('selectedConditionalFormattingIcon', function() {

        if (!dxGridExtensions.isUndefinedOrNull($scope.selectedConditionalFormattingRule)) {
            $scope.selectedConditionalFormattingRule.icon = $scope.selectedConditionalFormattingIcon;
            applyConditionalFormattingRule();
        }
    });

    $scope.$watch('currentConditionalFormattingColor', function() {

        if (dxGridExtensions.isUndefinedOrNull($scope.currentConditionalFormattingColor) || dxGridExtensions.isUndefinedOrNull($scope.conditionalFormatingGrid) || (dxGridExtensions.isUndefinedOrNull($scope.selectedConditionalFormattingRule))) return;

        var grid = $scope.conditionalFormatingGrid.dxDataGrid('instance');

        if (dxGridExtensions.isUndefinedOrNull(grid)) return;

        $scope.selectedConditionalFormattingRule.color = $scope.currentConditionalFormattingColor;

        applyConditionalFormattingRule();
    });

    $scope.$watch('selectedConditionalFormattingRule', function() {

        updateCreateRuleDisabled();

        if (dxGridExtensions.isUndefinedOrNull($scope.selectedConditionalFormattingRule)) return;

        $scope.isExpressionDisabled = !$scope.selectedConditionalFormattingRule.isExpressionBased;

        applyConditionalFormattingRule();
    });

    $scope.$watch('conditionalFormatingExpressionText', function() {

        updateCreateRuleDisabled();

        if (dxGridExtensions.isUndefinedOrNull($scope.selectedConditionalFormattingRule)) return;

        if ($scope.conditionalFormatingExpressionText === '') {
            $scope.conditionalFormattingResult = [];
        }
    });

    $scope.$watch('gridManagement.showConditionalFormattingConsole', function() {

        if (!dxGridExtensions.isUndefinedOrNull($scope.conditionalFormatingGrid)) {
            var conditionalFormattingGrid = $scope.conditionalFormatingGrid.dxDataGrid('instance');
            conditionalFormattingGrid.option('dataSource', null);
        };


        $scope.conditionalFormatingExpressionText = '';
        $scope.selectedConditionalFormattingIcon = defaultIcon;
        $scope.currentConditionalFormattingColor = defaultColor;
        $scope.conditionalFormatingTargetColumn = null;

        dxGridExtensions.resetSelectBoxValue("#conditionFormatingTargetColumn");

    });

    $scope.$watch('conditionalFormatingTargetColumn', function() {

        updateCreateRuleDisabled();

        if (dxGridExtensions.isUndefinedOrNull($scope.conditionalFormatingTargetColumn)) return;

        applyConditionalFormattingRule();
    });

    $scope.$watch('selectedConditionalFormattingRules', function() {

        if ($scope.selectedConditionalFormattingRules.length == 0) return;

        $scope.selectedConditionalFormattingRule = $scope.selectedConditionalFormattingRules[0].items[0];
    });

    $scope.$watch('selectedExistingConditionalFormattingRule', function() {
        $scope.isExistingRuleActionDisabled = dxGridExtensions.isUndefinedOrNull($scope.selectedExistingConditionalFormattingRule);
    });

    $scope.consitionalFormattingAvailableColumnsSelectBoxOptions = {
        bindingOptions: {
            items: "availableColumns",
            value: "selectedAvailableColumn",
            disabled: 'isExpressionDisabled'
        },
        onItemClick: function(e) {
            $scope.conditionalFormatingExpressionText += '[' + e.itemData + ']';
            $scope.selectedAvailableColumn = null;
        },
        placeholder: "Add column to expression",
    };

    $scope.conditionalFormattingTestExpressionButtonOptions = {
        icon: 'fa fa-hacker-news',
        text: 'Test expression',
        bindingOptions: {
            disabled: 'isCreateRuleDisabled'
        },
        onClick: applyConditionalFormattingRule
    };

    $scope.conditionalFormattingPopupOptions = {
        width: 750,
        contentTemplate: "info",
        showTitle: false,
        height: "auto",
        showTitle: true,
        title: "Management - Conditional Formatting",
        dragEnabled: true,
        closeOnOutsideClick: true,
        bindingOptions: {
            visible: "gridManagement.showConditionalFormattingConsole"
        }
    };

    $scope.conditionalFormatingExpressionTextBoxOptions = {
        bindingOptions: {
            value: "conditionalFormatingExpressionText",
            disabled: 'isExpressionDisabled'
        },
        placeholder: "Enter expression...",
        showClearButton: true
    };

    $scope.createConditionalFormattingButtonOptions = {
        icon: 'fa fa-hacker-news',
        text: 'Create expression',
        bindingOptions: {
            disabled: 'isCreateRuleDisabled'
        },
        onClick: function(e) {

            if (dxGridExtensions.isUndefinedOrNull($scope.gridInstance)) return;

            var rule = conditionalFormattingConfiguration.createRule(
                $scope.selectedConditionalFormattingRule.text,
                $scope.conditionalFormatingTargetColumn,
                $scope.conditionalFormatingExpressionText,
                $scope.currentConditionalFormattingColor,
                $scope.selectedConditionalFormattingIcon
            );

            _.remove($scope.config.conditionalFormattingRules, { target: rule.target });

            $scope.config.conditionalFormattingRules.push(rule)

            $scope.gridInstance.repaint();

            $scope.gridManagement.showConditionalFormattingConsole = false;

        }
    };

    $scope.conditionalFormatingAvailableTargetColumnsOptions = {
        bindingOptions: {
            value: "conditionalFormatingTargetColumn",
            items: "availableColumns"
        },
        placeholder: "Choose target column...",
    };

    $scope.conditionalFormattingResultGridPopupOptions = {
        bindingOptions: { dataSource: 'conditionalFormattingResult' },
        height: 350,
        resize: false,
        onInitialized: function(e) {
            $scope.conditionalFormatingGrid = e.element;
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

    $scope.rulesListOptions = {
        bindingOptions: {
            selectedItems: 'selectedConditionalFormattingRules'
        },
        showSelectionControls: true,
        selectionMode: "single",
        selectAllMode: "allPages",
        items: conditionalFormattingConfiguration.availableRules,
        height: "50%",
        grouped: true,
        collapsibleGroups: true,
        groupTemplate: function(data) {
            return $("<div>Type: " + data.key + "</div>");

        }
    };

    $scope.conditionalFormattingColorBox = {
        bindingOptions: {
            value: "currentConditionalFormattingColor"
        },
        applyValueMode: "instantly"
    };

    $scope.availableIconsSelectBoxOptions = {
        dataSource: conditionalFormattingConfiguration.availableIcons,
        displayExpr: "name",
        valueExpr: "css",
        bindingOptions: {

            value: 'selectedConditionalFormattingIcon'
        },
        placeholder: 'Select an icon...'
    };

    $scope.deleteExistingRuleButtonOptions = {
        text: 'Delete',
        bindingOptions: {
            disabled: 'isExistingRuleActionDisabled'
        },
        onClick: function() {

            _.remove($scope.config.conditionalFormattingRules, { target: $scope.selectedExistingConditionalFormattingRule.target });

            $scope.gridInstance.repaint();

            $scope.gridManagement.showConditionalFormattingConsole = false;
        }
    };

    $scope.loadExistingRuleButtonOptions = {
        text: 'Load',
        bindingOptions: {
            disabled: 'isExistingRuleActionDisabled'
        },
        onClick: function() {

            $scope.conditionalFormatingTargetColumn = $scope.selectedExistingConditionalFormattingRule.target;
            $scope.conditionalFormatingExpressionText = $scope.selectedExistingConditionalFormattingRule.expression;
            $scope.currentConditionalFormattingColor = $scope.selectedExistingConditionalFormattingRule.color;
            $scope.selectedConditionalFormattingIcon = $scope.selectedExistingConditionalFormattingRule.icon;

            $("#conditionalFormattingRuleList")
                .dxList("instance")
                .selectItem(_.find(conditionalFormattingConfiguration.getAllRules(), function(rule) {
                    return rule.text == $scope.selectedExistingConditionalFormattingRule.text
                }));

        }
    };

    $scope.existingConditionalFormattingRulesSelectBoxOptions = {
        displayExpr: "target",
        bindingOptions: {
            dataSource: 'config.conditionalFormattingRules',
            value: 'selectedExistingConditionalFormattingRule'
        },
        placeholder: 'Load existing rule...'
    };


    function applyConditionalFormattingExpression() {

        try {
            $scope.conditionalFormattingResult = [];
            var expression = $scope.conditionalFormatingExpressionText;
            $scope.conditionalFormattingExpressionTargetedColumns = $scope.expression === '' ? [] : expression.match(/\[(.*?)\]/g);

            _.each($scope.dataSource, function(item) {

                var conditionalFormatingresult = {};

                _.each($scope.conditionalFormattingExpressionTargetedColumns, function(column) {

                    var sourceColumn = column.substring(1, column.length - 1);

                    if (!item.hasOwnProperty(sourceColumn)) throw new Error("Column " + sourceColumn + " does not exist");

                    conditionalFormatingresult[sourceColumn] = item[sourceColumn];

                });

                conditionalFormatingresult[$scope.conditionalFormatingTargetColumn] = item[$scope.conditionalFormatingTargetColumn];

                $scope.conditionalFormattingResult.push(conditionalFormatingresult);

            });

        } catch (e) {

            $scope.conditionalFormattingResult.push({
                error: e.message
            })

            return;
        }
    };

    function applyConditionalFormattingRule() {

        applyConditionalFormattingExpression();

        var grid = $scope.conditionalFormatingGrid.dxDataGrid('instance');

        if (dxGridExtensions.isUndefinedOrNull($scope.selectedConditionalFormattingRule)) return;

        var rule = conditionalFormattingConfiguration.createRule(
            $scope.selectedConditionalFormattingRule.text,
            $scope.conditionalFormatingTargetColumn,
            $scope.conditionalFormatingExpressionText,
            $scope.currentConditionalFormattingColor,
            $scope.selectedConditionalFormattingIcon
        );

        grid.option("onCellPrepared", function(options) {
            conditionalFormattingConfiguration.applyConditionalFormattingExpressionOnCell(options, rule, $scope.dataSource);
        });

        grid.repaint();
    };

    function updateCreateRuleDisabled() {

        if ($scope.conditionalFormatingTargetColumn == null || dxGridExtensions.isUndefinedOrNull($scope.selectedConditionalFormattingRule)) {
            $scope.isCreateRuleDisabled = true;
            return;
        }

        if ($scope.selectedConditionalFormattingRule.isExpressionBased && $scope.conditionalFormatingExpressionText === '') {
            $scope.isCreateRuleDisabled = true;
            return;
        }

        $scope.isCreateRuleDisabled = false;
    };


});
