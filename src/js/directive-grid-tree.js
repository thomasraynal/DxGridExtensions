dxGridExtension.directive('treeGrid', function($timeout, $controller, customColumnConfiguration, conditionalFormattingConfiguration) {
    return {
        restrict: "E",
        templateUrl: 'view.grid.tree.html',
        scope: true,
        link: {
            pre: function(scope, element, attrs) {

                scope.self = scope.$parent;

                //refacto: implement inheritance
                if (!scope.self.config) scope.self.config = {};
                scope.self.config[attrs.instance] = {};

                scope.treeListName = attrs.instance;
                scope.treeListOptions = scope.self[attrs.options];
                scope.$control = element;

                if (!scope.self.gridManagement) scope.self.gridManagement = {};
                scope.self.gridManagement[scope.treeListName] = {};

                var columns = dxGridExtensions.isUndefinedOrNull(getConfig('columns')) ? null : getConfig('columns');

                setConfig('columns', columns);

                $timeout(() => initializeInternal());

                scope.$watch(scope.treeListOptions.bindingOptions.dataSource, function() {

                    var dataSource = Object.byString(scope, scope.treeListOptions.bindingOptions.dataSource.dataPath);

                    if (dxGridExtensions.isUndefinedOrNull(dataSource) || dataSource.length == 0) return;

                    var template = dataSource[0];

                    var index = 0;

                    var columns = _.transform(Object.keys(template), function(aggregate, field) {

                        var columnOption = {
                            dataField: field,
                            caption: field,
                            dataType: "string",
                            format: { type: '', precision: 0 },
                            visibleIndex: index++
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

                                    if (window.dxGridExtensions.isInt(dataSource[i][field])) {

                                        columnOption.dataType = "number";
                                        columnOption.format = { type: 'fixedpoint', precision: 0 };
                                        break;
                                    }

                                    if (window.dxGridExtensions.isFloat(dataSource[i][field])) {

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
                    return Object.byString(scope, scope.treeListOptions.bindingOptions.dataSource.dataPath);
                };

                function getGridInstance() {
                    if (dxGridExtensions.isUndefinedOrNull(scope.$control)) return null;
                    try {
                        //if the grid has been rendered
                        var grid = (scope.self[scope.treeListName].NAME) ? scope.self[scope.treeListName] : scope.$control.find('#treeGrid').dxTreeList("instance");
                        if (scope.self[scope.treeListName] !== grid) scope.self[scope.treeListName] = grid;
                        return grid;

                    } catch (ex) {
                        return null;
                    }
                };

                function setConfig(index, value) {
                    if (dxGridExtensions.isUndefinedOrNull(scope.self.config[scope.treeListName])) scope.self.config[scope.treeListName] = {};
                    scope.self.config[scope.treeListName][index] = value;
                };

                function getConfig(index) {
                    if (dxGridExtensions.isUndefinedOrNull(scope.self.config[scope.treeListName])) scope.self.config[scope.treeListName] = {};
                    return scope.self.config[scope.treeListName][index];
                };

                function initializeInternal() {

                    $timeout(() => {

                        var grid = getGridInstance();

                        //fixed conditional formatting
                        if (dxGridExtensions.isUndefinedOrNull(grid.option("onCellPrepared"))) {
                            addEventHandler("onCellPrepared", function(options) {
                                _.each(getConfig('conditionalFormattingRules'), function(rule) {

                                    var dataSource = Object.byString(scope, scope.treeListOptions.bindingOptions.dataSource.dataPath);

                                    conditionalFormattingConfiguration.applyConditionalFormattingExpressionOnCell(options, rule, dataSource);
                                });
                            });
                        }

                        //init context menu
                        addEventHandler("onContextMenuPreparing", function(options) {
                            if (options.row && options.row.rowType === 'data') {
                                options.items = getGridMenuItems(options);
                            }
                        });;

                        addEventHandler("customizeColumns", function(columns) {
                            _.each(columns, function(column) {
                                column.groupCellTemplate = window.dxGridExtensions.groupCellTemplate;
                            });
                        });

                    });
                };

                function addEventHandler(ev, handler) {

                    var grid = getGridInstance();

                    var current = grid.option(ev);

                    grid.option(ev, function(options) {
                        if (null != current) current(options);
                        handler(options);
                    })
                };

                function getGridMenuItems(element) {

                    scope.self.gridManagement[scope.treeListName].currentColumn = element.column;
                    scope.self.gridManagement[scope.treeListName].currentRow = element.row;

                    return [{
                        text: 'Management - Columns',
                        onItemClick: function() {
                            scope.self.gridManagement[scope.treeListName].showColumnChooserConsole = true;
                        }
                    }, {
                        text: 'Management - Conditional Formatting',
                        onItemClick: function() {
                            scope.self.gridManagement[scope.treeListName].showConditionalFormattingConsole = true;
                        }
                    }, {
                        text: 'Management - Custom Columns',
                        onItemClick: function() {
                            scope.self.gridManagement[scope.treeListName].showCustomColumnConsole = true;
                        }
                    }, {
                        text: 'Current Column - Modify',
                        onItemClick: function() {

                            scope.self.gridManagement[scope.treeListName].showColumnManagementConsole = true;
                        }
                    }]
                };
            }

        }

    }

});
