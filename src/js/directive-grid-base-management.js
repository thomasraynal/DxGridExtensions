dxGridExtension.controller('baseGridManagement', function baseGridManagementCrtl(
    $scope,
    attributes,
    element,
    parent,
    customColumnConfiguration,
    conditionalFormattingConfiguration,
    $controller,
    $timeout) {

    initialize();

    $scope.safeUpdate = (action) => {
        $scope.management.instance.beginUpdate();
        action();
        $scope.management.instance.endUpdate();
    };

    $scope.$watch($scope.management.options.bindingOptions.columns, function() {

        if (!$scope.canGroup) return;

        var columns = getConfig('columns');
        var groupItems = getConfig('groupItems');


        var groups = _.transform(columns, function(aggregate, item) {

            if (item.dataType === "number") {

                var existingGroup = _.find(groupItems, function(group) {
                    return item.column == item.dataField;
                });

                if (!dxGridExtensions.isUndefinedOrNull(existingGroup)) {
                    aggregate.push(groupItem);
                } else {

                    var groupItem = createDefaultNumberGroupItem(item.dataField);
                    aggregate.push(groupItem);
                }
            }
        }, []);

        setConfig('groupItems', groups);
    });

    $scope.$watch($scope.management.options.bindingOptions.dataSource, function() {


        if (dxGridExtensions.isUndefinedOrNull($scope.management.datasource) || $scope.management.datasource.length == 0) return;


        var template = $scope.management.datasource[0];

        var index = 0;

        var columns = _.transform(Object.keys(template), function(aggregate, field) {

            var columnOption = {
                dataField: field,
                caption: field,
                dataType: "string",
                visibleIndex: index++,
                format: { type: '', precision: 0 }
            };

            var existingColumn = _.find(getConfig('columns'), function(c) {
                return c.dataField == field
            });

            if (!dxGridExtensions.isUndefinedOrNull(existingColumn)) {

                aggregate.push(existingColumn);

            } else {

                for (var i = 0; i < $scope.management.datasource.length; i++) {


                    if (!dxGridExtensions.isUndefinedOrNull($scope.management.datasource[i][field])) {

                        if (typeof($scope.management.datasource[i][field]) === "boolean") {
                            columnOption.dataType = "boolean";
                            break;
                        }

                        if (dxGridExtensions.isInt($scope.management.datasource[i][field])) {
                            columnOption.dataType = "number";
                            columnOption.format = { type: 'fixedpoint', precision: 0 };
                            break;
                        }

                        if (dxGridExtensions.isFloat($scope.management.datasource[i][field])) {
                            columnOption.dataType = "number";
                            columnOption.summaryType = "sum";
                            columnOption.format = { type: 'fixedpoint', precision: 2 };
                            break;
                        }

                        columnOption.dataType = "string";
                        columnOption.format = { type: '', precision: 0 };

                        break;
                    }
                };

                columnOption.isCustomColumn = false;

                aggregate.push(columnOption);

            }
        }, []);

        _.each(getConfig('customColumns'), function(customColumn) {

            var column = _.find(getConfig('columns'), function(c) {
                return c.dataField == customColumn.name
            });

            column.isCustomColumn = true;

            column.calculateCellValue = (data) => {
                return customColumnConfiguration.computeCustomColumn(this.rule, data);
            };

            column.rule = customColumn.rule;

        });

        setConfig('columns', columns);
    });

    function setConfig(key, value) {
        $scope.management[key] = value;
    };

    function getConfig(index) {
        return $scope.management[index];
    };

    function addEventHandler(ev, handler) {

        var grid = getGridInstance();
        var current = grid.option(ev);

        grid.option(ev, function(options) {
            if (null != current) current(options);
            handler(options);
        });
    };

    function initialize() {

        $scope.self = parent

        if (dxGridExtensions.isUndefinedOrNull($scope.self.gridManagement)) {
            $scope.self.gridManagement = {};
        }


        $scope.management = $scope.self.gridManagement[attributes.instance] = {};

        $scope.management.columns = [];
        $scope.management.groupItems = [];
        $scope.management.customColumns = [];
        $scope.management.conditionalFormattingRules = [];

        $scope.management.instance = $scope.self[attributes.instance];

        $scope.management.name = attributes.instance;
        $scope.management.options = $scope.self[attributes.options];

        $scope.management.datasource = $scope.self[attributes.datasource];

        $scope.$control = element;

        if (dxGridExtensions.isUndefinedOrNull($scope.management.options.bindingOptions)) {
            $scope.management.options.bindingOptions = {};
        }

        $scope.management.options.bindingOptions.dataSource = 'management.datasource';
        $scope.management.options.bindingOptions.columns = 'management.columns';

        if ($scope.canGroup) $scope.management.options.bindingOptions['summary.groupItems'] = 'management.groupItems';


        var columns = dxGridExtensions.isUndefinedOrNull(getConfig('columns')) ? null : getConfig('columns');
        setConfig('columns', columns);

        if ($scope.canGroup) {
            var groupItems = dxGridExtensions.isUndefinedOrNull(getConfig('groupItems')) ? null : getConfig('groupItems');
            if (!$scope.canGroup) setConfig('groupItems', groupItems);
        }

        $scope.management.save = () => {
            return {
                columns: $scope.management.columns,
                conditionalFormattingRules: $scope.management.conditionalFormattingRules,
                customColumns: $scope.management.customColumns,
                groupItems: $scope.management.groupItems,
                name: $scope.management.name,
                state: ($scope.canGroup) ? $scope.management.instance.state() : null
            };
        };

        $scope.management.restore = (layout) => {

            $scope.management.conditionalFormattingRules = _.transform(layout.conditionalFormattingRules, (aggregate, rule) => {

                aggregate.push(conditionalFormattingConfiguration.createRule(
                    rule.text,
                    rule.target,
                    rule.expression,
                    rule.color,
                    rule.icon
                ));

            }, []);

            $scope.management.customColumns = _.transform(layout.customColumns, (aggregate, column) => {

                aggregate.push(customColumnConfiguration.createCustomColumn(
                    column.name,
                    column.expression,
                    column.formatting,
                    column.visibleIndex
                ));

            }, []);

            $scope.management.columns = _.transform(layout.columns, (aggregate, column) => {

                if (column.isCustomColumn) {
                    var customColumn = _.find($scope.management.customColumns, (custom) => custom.dataField == column.dataField);
                    aggregate.push(customColumn);
                } else {
                    aggregate.push(column);
                }

            }, []);


            if ($scope.canGroup) {

                $scope.management.groupItems = layout.groupItems;
                $scope.management.instance.state(layout.state);
            }


            $scope.management.instance.refresh();
            $scope.management.instance.repaint();

        };

        $timeout(() => {

            var grid = getGridInstance();

            if (dxGridExtensions.isUndefinedOrNull(grid.option("onCellPrepared"))) {
                addEventHandler("onCellPrepared", function(options) {
                    _.each(getConfig('conditionalFormattingRules'), function(rule) {
                        conditionalFormattingConfiguration.applyConditionalFormattingExpressionOnCell(
                            options,
                            rule,
                            $scope.management.datasource,
                            $scope.management.customColumns);
                    });
                });
            }

            addEventHandler("onContentReady", function(e) {

                //keep sync with internal dxDataGrid processes (column chooser, column position change...)
                _.each($scope.management.columns, (column) => {
                    column.visible = e.component.columnOption(column.dataField, "visible");
                    column.visibleIndex = e.component.columnOption(column.dataField, "visibleIndex");
                });


            });

            addEventHandler("onContextMenuPreparing", function(options) {
                if (options.row && options.row.rowType === 'data') {
                    options.items = getGridMenuItems(options);
                }
            });

            addEventHandler("customizeColumns", function(columns) {
                _.each(columns, function(column) {
                    column.groupCellTemplate = window.dxGridExtensions.groupCellTemplate;
                });
            });

        });
    };

    function getGridInstance() {
        if (dxGridExtensions.isUndefinedOrNull($scope.$control)) return null;
        try {
            //if the grid has been rendered
            var grid = ($scope.self[$scope.management.name].NAME) ? $scope.self[$scope.management.name] : $scope.getDevExpressControl();
            if ($scope.management.instance !== grid) {
                $scope.management.instance = $scope.self[$scope.management.name] = grid;
                $timeout(() => $scope.management.instance.repaint());
            }
            return grid;

        } catch (ex) {
            return null;
        }
    };

    function getGridMenuItems(element) {

        $scope.management.currentColumn = element.column;
        $scope.management.currentRow = element.row;

        var menu = [{
            text: 'Management - Columns',
            onItemClick: function() {
                $scope.management.showColumnChooserConsole = true;
            }
        }, {
            text: 'Management - Conditional Formatting',
            onItemClick: function() {
                $scope.management.showConditionalFormattingConsole = true;
            }
        }, {
            text: 'Management - Custom Columns',
            onItemClick: function() {
                $scope.management.showCustomColumnConsole = true;
            }
        }, {
            text: 'Current Column - Modify',
            onItemClick: function() {
                $scope.management.showColumnManagementConsole = true;
            }
        }];


        if ($scope.canGroup) {

            menu.push({
                text: 'Current Column - Remove Aggregation',
                onItemClick: function() {
                    _.remove($scope.management.groupItems, function(item) {
                        return item.column === $scope.management.currentColumn.dataField;
                    });
                }
            });

            menu.push({
                text: 'Current Column - Create Aggregation',
                onItemClick: function() {

                    if (null == $scope.management.currentColumn || $scope.management.currentColumn.dataType == "string") return;

                    var groupItems = getConfig('groupItems');

                    if (dxGridExtensions.isUndefinedOrNull(groupItems)) return;

                    var result = _.find($scope.self.gridManagement.groupItems, function(item) {
                        return item.column === $scope.management.currentColumn.dataField;
                    });

                    if (!dxGridExtensions.isUndefinedOrNull(result)) return;

                    var group = createDefaultNumberGroupItem($scope.management.currentColumn.dataField);
                    $scope.management.groupItems.push(group);
                }
            });
        }

        return menu;

    };

    function createDefaultNumberGroupItem(name) {
        return {
            column: name,
            summaryType: "sum",
            showInGroupFooter: false,
            alignByColumn: true,
            valueFormat: { type: 'fixedpoint', precision: 2 },
            displayFormat: "{0}"
        };
    };

    $controller('columnManagement', { $scope: $scope });
    $controller('conditionalFormatting', { $scope: $scope });
    $controller('columnChooser', { $scope: $scope })
    $controller('customColumns', { $scope: $scope })

});
