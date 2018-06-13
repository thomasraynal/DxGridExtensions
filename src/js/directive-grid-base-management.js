dxGridExtension.controller('baseGridManagement', function baseGridManagementCrtl($scope, attributes, element, parent, customColumnConfiguration, conditionalFormattingConfiguration, $controller, $timeout) {

    initialize();

    $scope.isRestore = false;

    $scope.safeUpdate = function(action) {
        $scope.management.instance.beginUpdate();
        action();
        $scope.management.instance.endUpdate();
    };

    $scope.$watch(function() {
        return $scope.self[attributes.datasource];
    }, function() {

        $scope.management.datasource = $scope.self[attributes.datasource];

        if ($scope.isRestore) return;

        if (dxGridExtensions.isUndefinedOrNull($scope.self[attributes.datasource]) || $scope.self[attributes.datasource].length == 0) return;

        setUpColumnsFromDataSource();

        setUpCustomColumns();

        createDataGroups();
    });

    function setUpColumnsFromDataSource() {

        var template = $scope.management.datasource[0];

        var index = 0;

        var columns = _.transform(Object.keys(template), function(aggregate, field) {

            var columnOption = {
                dataField: field,
                caption: field,
                dataType: "string",
                visibleIndex: index++,
                hasAggregation: false,
                format: { type: '', precision: 0 }
            };

            var existingColumn = _.find($scope.management.columns, function(c) {
                return c.dataField == field;
            });

            if (dxGridExtensions.isUndefinedOrNull(existingColumn)) {

                for (var i = 0; i < $scope.management.datasource.length; i++) {

                    if (!dxGridExtensions.isUndefinedOrNull($scope.management.datasource[i][field])) {

                        if (typeof $scope.management.datasource[i][field] === "boolean") {
                            columnOption.dataType = "boolean";
                            columnOption.hasAggregation = false;
                            break;
                        }

                        if (dxGridExtensions.isInt($scope.management.datasource[i][field])) {
                            columnOption.dataType = "number";
                            columnOption.format = { type: 'fixedpoint', precision: 0 };
                            columnOption.hasAggregation = true;

                            break;
                        }

                        if (dxGridExtensions.isFloat($scope.management.datasource[i][field])) {
                            columnOption.dataType = "number";
                            columnOption.summaryType = "sum";
                            columnOption.format = { type: 'fixedpoint', precision: 2 };
                            columnOption.hasAggregation = true;
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

        _.each(columns, function(column) {
            $scope.management.columns.push(column);
        });
    };

    function setUpCustomColumns() {

        _.each($scope.management.customColumns, function(customColumn) {

            var column = _.find($scope.management.columns, function(c) {
                return c.dataField == customColumn.name;
            });

            column.isCustomColumn = true;

            column.calculateCellValue = function(data) {
                return customColumnConfiguration.computeCustomColumn(customColumn.expression, data);
            };

            column.expression = customColumn.expression;
        });
    };

    function createDataGroups() {

        if (!$scope.canGroup) return;

        var columns = $scope.management.columns;
        var groupItems = $scope.management.groupItems;

        var groups = _.transform(columns, function(aggregate, column) {

            if (column.dataType === "number") {

                var existingGroup = _.find(groupItems, function(group) {
                    return column.dataField == group.column;
                });

                if (dxGridExtensions.isUndefinedOrNull(existingGroup) && column.hasAggregation) {
                    var groupItem = createDefaultNumberGroupItem(column.dataField);
                    aggregate.push(groupItem);
                }
            }
        }, []);

        _.each(groups, function(group) {
            $scope.management.groupItems.push(group);
        });
    };

    function addEventHandler(ev, handler) {

        var current = $scope.management.instance.option(ev);

        $scope.management.instance.option(ev, function(options) {
            if (null != current) current(options);
            handler(options);
        });
    };

    function initialize() {

        $scope.self = parent;

        if (dxGridExtensions.isUndefinedOrNull($scope.self.gridManagement)) {
            $scope.self.gridManagement = {};
        }

        $scope.management = $scope.self.gridManagement[attributes.instance] = {};

        $scope.management.columns = [];
        $scope.management.groupItems = [];
        $scope.management.customColumns = [];
        $scope.management.conditionalFormattingRules = [];

        $scope.management.instance = $scope.self[attributes.instance];
        $scope.management.menu = $scope.self[attributes.menu];

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

        var columns = dxGridExtensions.isUndefinedOrNull($scope.management.columns) ? null : $scope.management.columns;
        $scope.management.columns = columns;

        if ($scope.canGroup) {
            var groupItems = dxGridExtensions.isUndefinedOrNull($scope.management.groupItems) ? null : $scope.management.groupItems;
            if (!$scope.canGroup) $scope.management.groupItems = groupItems;
        }

        $scope.management.export = function() {

            var source = $scope.self[attributes.datasource];

            var gridData = new DevExpress.data.DataSource({
                store: source,
                paginate: false
            });

            gridData.filter($scope.management.instance.getCombinedFilter());

            return gridData.load().then(function(data) {

                var result = _.cloneDeep(data);

                var columns = _.transform($scope.management.instance.getVisibleColumns(), function(aggregate, column) {
                    aggregate.push(column.dataField);
                }, []);

                for (var i = 0; i < result.length; i++) {

                    for (var property in result[i]) {
                        if (result[i].hasOwnProperty(property)) {
                            if (!_.some(columns, function(column) {
                                    return property === column;
                                })) {
                                delete result[i][property];
                            }
                        }
                    }
                }

                _.each(result, function(row) {
                    _.each($scope.management.customColumns, function(customColumn) {
                        row[customColumn.name] = customColumnConfiguration.computeCustomColumn(customColumn.expression, row);
                    });
                });

                return result;
            });
        };

        $scope.management.save = function() {

            var state = $scope.canGroup ? $scope.management.instance.state() : null;

            return {
                columns: $scope.management.columns,
                conditionalFormattingRules: $scope.management.conditionalFormattingRules,
                customColumns: $scope.management.customColumns,
                groupItems: $scope.management.groupItems,
                name: $scope.management.name,
                state: state
            };
        };

        $scope.management.restore = function(layout) {

            $scope.isRestore = true;

            $timeout(function() {


                $scope.management.columns = [];
                $scope.management.groupItems = [];

                $scope.management.conditionalFormattingRules = _.transform(layout.conditionalFormattingRules, function(aggregate, rule) {

                    aggregate.push(conditionalFormattingConfiguration.createRule(rule.text, rule.target, rule.expression, rule.color, rule.icon));
                }, []);

                $scope.management.customColumns = _.transform(layout.customColumns, function(aggregate, column) {

                    aggregate.push(customColumnConfiguration.createCustomColumn(column.name, column.expression, column.formatting, column.visibleIndex));
                }, []);

                _.each(layout.columns, function(column) {
                    $scope.management.columns.push(column);
                });

                if ($scope.canGroup) {

                    _.each(layout.groupItems, function(group) {
                        $scope.management.groupItems.push(group);
                    });
                }

                setUpCustomColumns();

                //important
                if ($scope.canGroup) $scope.management.instance.state(layout.state);

                $scope.isRestore = false;

            });
        };

        $timeout(function() {

            var grid = getGridInstance();

            if (dxGridExtensions.isUndefinedOrNull(grid.option("onCellPrepared"))) {
                addEventHandler("onCellPrepared", function(options) {
                    _.each($scope.management.conditionalFormattingRules, function(rule) {
                        conditionalFormattingConfiguration.applyConditionalFormattingExpressionOnCell(options, rule, $scope.management.datasource, $scope.management.customColumns);
                    });
                });
            }

            addEventHandler("onContentReady", function(e) {

                if ($scope.isRestore) return;

                syncColumns(e);

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

    //refacto - we should use grid layout columns and drop the bindings, i.e management.columns
    function syncColumns(e) {

        var trackedProperties = ["visible", "visibleIndex", "fixed", "fixedPosition", "groupIndex", "sortOrder", "sortIndex"];

        function clean(obj) {
            for (var property in obj) {
                if (dxGridExtensions.isUndefinedOrNull(obj[property])) {
                    delete obj[property];
                }
            }
        }

        _.each($scope.management.columns, function(column) {

            column.visible = e.component.columnOption(column.dataField, "visible");
            column.visibleIndex = e.component.columnOption(column.dataField, "visibleIndex");
            column.fixed = e.component.columnOption(column.dataField, "fixed");
            column.fixedPosition = e.component.columnOption(column.dataField, "fixedPosition");
            column.groupIndex = e.component.columnOption(column.dataField, "groupIndex");
            column.sortOrder = e.component.columnOption(column.dataField, "sortOrder");
            column.sortIndex = e.component.columnOption(column.dataField, "sortIndex");
            column.hasAggregation = _.some($scope.management.groupItems, function(group) {
                return group.column == column.dataField;
            });

            if (column.isCustomColumn) {

                var customColumn = _.find($scope.management.customColumns, function(custom) {
                    return custom.dataField == column.dataField;
                });

                customColumn.visible = column.visible;
                customColumn.visibleIndex = column.visibleIndex;
                customColumn.fixed = column.fixed;
                customColumn.fixedPosition = column.fixedPosition;
                customColumn.groupIndex = column.groupIndex;
                customColumn.hasAggregation = column.hasAggregation;

                clean(customColumn);
            }

            clean(column);

        });
    };

    function getGridInstance() {
        if (dxGridExtensions.isUndefinedOrNull($scope.$control)) return null;
        try {
            //if the grid has been rendered
            var grid = $scope.self[$scope.management.name].NAME ? $scope.self[$scope.management.name] : $scope.getDevExpressControl();
            if ($scope.management.instance !== grid) {
                $scope.management.instance = $scope.self[$scope.management.name] = grid;
                $timeout(function() {
                    return $scope.management.instance.repaint();
                });
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
            onItemClick: function onItemClick() {
                $scope.management.showColumnChooserConsole = true;
            }
        }, {
            text: 'Management - Conditional Formatting',
            onItemClick: function onItemClick() {
                $scope.management.showConditionalFormattingConsole = true;
            }
        }, {
            text: 'Management - Custom Columns',
            onItemClick: function onItemClick() {
                $scope.management.showCustomColumnConsole = true;
            }
        }, {
            text: 'Current Column - Modify',
            onItemClick: function onItemClick() {
                $scope.management.showColumnManagementConsole = true;
            }
        }];

        if ($scope.canGroup) {

            menu.push({
                text: 'Current Column - Remove Aggregation',
                onItemClick: function onItemClick() {
                    _.remove($scope.management.groupItems, function(item) {
                        return item.column === $scope.management.currentColumn.dataField;
                    });
                }
            });

            menu.push({
                text: 'Current Column - Create Aggregation',
                onItemClick: function onItemClick() {

                    if (null == $scope.management.currentColumn || $scope.management.currentColumn.dataType == "string") return;

                    var groupItems = $scope.management.groupItems;

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

        if (!dxGridExtensions.isUndefinedOrNull($scope.management.menu)) {

            _.each($scope.management.menu, function(ext) {
                menu.push(ext);
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

    $controller('gridManagementExtensions', { $scope: $scope });
    $controller('columnManagement', { $scope: $scope });
    $controller('conditionalFormatting', { $scope: $scope });
    $controller('columnChooser', { $scope: $scope });
    $controller('customColumns', { $scope: $scope });
});
