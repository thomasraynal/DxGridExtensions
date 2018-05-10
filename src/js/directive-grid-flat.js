dxGridExtension.directive('flatGrid', function($timeout, customColumnConfiguration, conditionalFormattingConfiguration) {
    return {
        restrict: "E",
        templateUrl: 'view.grid.flat.html',
        scope: true,
        controller: function($scope, $attrs, $element, $controller) {

            $scope.self = $scope.$parent;

            ///////////////////////////////refacto: implement inheritance///////////////////////////////

            if (dxGridExtensions.isUndefinedOrNull($scope.self.gridManagement)) {
                $scope.self.gridManagement = {};
            }

            $scope.management = $scope.self.gridManagement[$attrs.instance] = {};

            $scope.management.columns = [];
            $scope.management.groupItems = [];
            $scope.management.customColumns = [];
            $scope.management.instance = $scope.self[$attrs.instance];

            $scope.management.name = $attrs.instance;
            $scope.management.options = $scope.self[$attrs.options];

            $scope.management.datasource = $scope.self[$attrs.datasource];

            $scope.$control = $element;

            $scope.management.options.bindingOptions = {
                dataSource: 'management.datasource',
                'summary.groupItems': 'management.groupItems',
                'columns': 'management.columns'
            };


            ///////////////////////////////////////////////// /////////////


            var columns = dxGridExtensions.isUndefinedOrNull(getConfig('columns')) ? null : getConfig('columns');
            var groupItems = dxGridExtensions.isUndefinedOrNull(getConfig('groupItems')) ? null : getConfig('groupItems');

            setConfig('columns', columns);
            setConfig('groupItems', groupItems);

            $timeout(() => initialize());

            $scope.$watch($scope.management.options.bindingOptions.columns, function() {

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

                _.each(getConfig('customColumns'), function(rule) {
                    customColumnConfiguration.computeCustomColumn(rule, $scope.management.datasource);
                });

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

                    if (null != existingColumn) {

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

                        aggregate.push(columnOption);

                    }
                }, []);


                setConfig('columns', columns);
            });


            function getGridInstance() {
                if (dxGridExtensions.isUndefinedOrNull($scope.$control)) return null;
                try {
                    //if the grid has been rendered
                    var grid = ($scope.self[$scope.management.name].NAME) ? $scope.self[$scope.management.name] : $scope.$control.find('#flatGrid').dxDataGrid("instance");
                    if ($scope.management.instance !== grid) {
                        $scope.management.instance = $scope.self[$scope.management.name] = grid;
                        $timeout(() => $scope.management.instance.repaint());
                    }
                    return grid;

                } catch (ex) {
                    return null;
                }
            };

            function setConfig(key, value) {
                $scope.management[key] = value;
            };

            function getConfig(index) {
                return $scope.management[index];
            };

            function initialize() {

                $timeout(() => {

                    var grid = getGridInstance();

                    if (dxGridExtensions.isUndefinedOrNull(grid.option("onCellPrepared"))) {
                        addEventHandler("onCellPrepared", function(options) {
                            _.each(getConfig('conditionalFormattingRules'), function(rule) {
                                conditionalFormattingConfiguration.applyConditionalFormattingExpressionOnCell(options, rule, $scope.management.datasource);
                            });
                        });
                    }

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

                    var state = getConfig('gridState');

                    if (!dxGridExtensions.isUndefinedOrNull(state)) {
                        var grid = getGridInstance();
                        grid.state(state);
                    }
                });
            };

            function addEventHandler(ev, handler) {

                var grid = getGridInstance();
                var current = grid.option(ev);

                grid.option(ev, function(options) {
                    if (null != current) current(options);
                    handler(options);
                });
            };

            function getGridMenuItems(element) {

                $scope.management.currentColumn = element.column;
                $scope.management.currentRow = element.row;

                return [{
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
                }, {
                    text: 'Current Column - Remove Aggregation',
                    onItemClick: function() {
                        _.remove($scope.management.groupItems, function(item) {
                            return item.column === $scope.management.currentColumn.dataField;
                        });
                    }
                }, {
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
                }]
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

            // $scope.management.exportExcel = function() {

            //     var grid = getGridInstance();
            //     grid.option("export", {
            //         enabled: false,
            //         fileName: $scope.self .container._config.title + "_" + moment($scope.self .workspace.date).format('YYYYMMDD')
            //     });

            //     grid.exportToExcel();
            // };


            $controller('baseGridManagement', {
                $scope: $scope,
                management: $scope.management,
                datasource: $scope.management.datasource
            });
        }


    };

});
