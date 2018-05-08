dxGridExtension.directive('flatGrid', function($timeout, customColumnConfiguration, conditionalFormattingConfiguration) {
    return {
        restrict: "E",
        templateUrl: 'view.grid.flat.html',
        scope: true,
        controller: function($scope, $attrs, $element, $controller) {

            $scope.self = $scope.$parent;

            //refacto: implement inheritance
            if (!$scope.self.config) $scope.self.config = {};
            $scope.self.config[$attrs.instance] = {};

            $scope.flatGridName = $attrs.instance;
            $scope.flatGridOptions = $scope.self[$attrs.options];
            $scope.$control = $element;

            if (!$scope.self.gridManagement) $scope.self.gridManagement = {};
            $scope.self.gridManagement[$scope.flatGridName] = {};

            var columns = dxGridExtensions.isUndefinedOrNull(getConfig('columns')) ? null : getConfig('columns');
            var groupItems = dxGridExtensions.isUndefinedOrNull(getConfig('groupItems')) ? null : getConfig('groupItems');

            setConfig('columns', columns);
            setConfig('groupItems', groupItems);

            $timeout(() => initializeInternal());

            $scope.$watch($scope.flatGridOptions.bindingOptions.columns, function() {

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

            $scope.$watch($scope.flatGridOptions.bindingOptions.dataSource, function() {

                var dataSource = getDataSource();

                if (dxGridExtensions.isUndefinedOrNull(dataSource) || dataSource.length == 0) return;

                _.each(getConfig('customColumns'), function(rule) {
                    customColumnConfiguration.computeCustomColumn(rule, dataSource);
                });

                var template = dataSource[0];

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

                        for (var i = 0; i < dataSource.length; i++) {


                            if (!dxGridExtensions.isUndefinedOrNull(dataSource[i][field])) {

                                if (typeof(dataSource[i][field]) === "boolean") {

                                    columnOption.dataType = "boolean";

                                    break;
                                }

                                if (dxGridExtensions.isInt(dataSource[i][field])) {

                                    columnOption.dataType = "number";
                                    columnOption.format = { type: 'fixedpoint', precision: 0 };
                                    break;
                                }

                                if (dxGridExtensions.isFloat(dataSource[i][field])) {

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

            function getDataSource() {
                return Object.byString($scope, $scope.flatGridOptions.bindingOptions.dataSource.dataPath);
            };

            function getGridInstance() {
                if (dxGridExtensions.isUndefinedOrNull($scope.$control)) return null;
                try {
                    //if the grid has been rendered
                    var grid = ($scope.self[$scope.flatGridName].NAME) ? $scope.self[$scope.flatGridName] : $scope.$control.find('#flatGrid').dxDataGrid("instance");
                    if ($scope.self[$scope.flatGridName] !== grid) $scope.self[$scope.flatGridName] = grid;
                    return grid;

                } catch (ex) {
                    return null;
                }
            };

            function setConfig(index, value) {
                if (dxGridExtensions.isUndefinedOrNull($scope.self.config[$scope.flatGridName])) $scope.self.config[$scope.flatGridName] = {};
                $scope.self.config[$scope.flatGridName][index] = value;
            };

            function getConfig(index) {
                if (dxGridExtensions.isUndefinedOrNull($scope.self.config[$scope.flatGridName])) $scope.self.config[$scope.flatGridName] = {};
                return $scope.self.config[$scope.flatGridName][index];
            };

            function initializeInternal() {

                $timeout(() => {

                    var grid = getGridInstance();

                    if (dxGridExtensions.isUndefinedOrNull(grid.option("onCellPrepared"))) {
                        addEventHandler("onCellPrepared", function(options) {
                            _.each(getConfig('conditionalFormattingRules'), function(rule) {
                                conditionalFormattingConfiguration.applyConditionalFormattingExpressionOnCell(options, rule, getDataSource());
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

                $scope.self.gridManagement[$scope.flatGridName].currentColumn = element.column;
                $scope.self.gridManagement[$scope.flatGridName].currentRow = element.row;

                return [{
                    text: 'Management - Columns',
                    onItemClick: function() {
                        $scope.self.gridManagement[$scope.flatGridName].showColumnChooserConsole = true;
                    }
                }, {
                    text: 'Management - Conditional Formatting',
                    onItemClick: function() {
                        $scope.self.gridManagement[$scope.flatGridName].showConditionalFormattingConsole = true;
                    }
                }, {
                    text: 'Management - Custom Columns',
                    onItemClick: function() {
                        $scope.self.gridManagement[$scope.flatGridName].showCustomColumnConsole = true;
                    }
                }, {
                    text: 'Current Column - Modify',
                    onItemClick: function() {
                        $scope.self.gridManagement[$scope.flatGridName].showColumnManagementConsole = true;
                    }
                }, {
                    text: 'Current Column - Remove Aggregation',
                    onItemClick: function() {
                        _.remove($scope.self.config[$scope.flatGridName].groupItems, function(item) {
                            return item.column === $scope.self.gridManagement[$scope.flatGridName].currentColumn.dataField;
                        });
                    }
                }, {
                    text: 'Current Column - Create Aggregation',
                    onItemClick: function() {

                        if (null == $scope.self.gridManagement[$scope.flatGridName].currentColumn || $scope.self.gridManagement[$scope.flatGridName].currentColumn.dataType == "string") return;

                        var groupItems = getConfig('groupItems');
                        if (dxGridExtensions.isUndefinedOrNull(groupItems)) return;

                        var result = _.find($scope.self.config.groupItems, function(item) {
                            return item.column === $scope.self.gridManagement[$scope.flatGridName].currentColumn.dataField;
                        });

                        if (!dxGridExtensions.isUndefinedOrNull(result)) return;

                        var group = createDefaultNumberGroupItem($scope.self.gridManagement[$scope.flatGridName].currentColumn.dataField);
                        $scope.self.config[$scope.flatGridName].groupItems.push(group);
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

            $scope.self.exportExcel = function() {

                var grid = getGridInstance();
                grid.option("export", {
                    enabled: false,
                    fileName: $scope.self.container._config.title + "_" + moment($scope.self.workspace.date).format('YYYYMMDD')
                });

                grid.exportToExcel();
            };


            $controller('baseGridManagement', { $scope: $scope, $attrs: $attrs });
        }


    };

});
