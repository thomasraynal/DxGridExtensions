dxGridExtension.controller('columnChooser', function columnChooserCrtl($scope, $controller, $timeout, customColumnConfiguration) {

    $scope.columnChooserGrid;
    $scope.gridManagement.showColumnChooserConsole = false;
    $scope.getAllColumns = getAllColumns;
    $scope.getColumnFormat = getColumnFormat;

    $scope.$watch(() => $scope.gridManagement.showColumnChooserConsole, function() {

        if (!$scope.gridManagement.showColumnChooserConsole) return;

        $timeout(() => {

            $scope.columnChooserDataSource.clear();

            var data = [];
            var columns = getAllColumns();

            var i = 0;

            _.forEach(columns, function(column) {
                $scope.columnChooserDataSource.insert(createColumnChooserColumnData(column, i++));
            });


            $scope.columnChooserGrid.dxDataGrid("instance").refresh();

        }, 500);
    });

    $scope.columnChooserPopupOptions = {
        width: 800,
        contentTemplate: "info",
        height: "100%",
        dragEnabled: true,
        showTitle: true,
        closeOnOutsideClick: false,
        title: "Management - Columns",
        bindingOptions: {
            visible: "gridManagement.showColumnChooserConsole"
        }
    };

    $scope.columnChooserDataSource = new DevExpress.data.ArrayStore({
        data: []
    });

    $scope.columnChooserGridOptions = {
        dataSource: {
            store: $scope.columnChooserDataSource,
            sort: 'position'
        },
        height: "90%",
        width: '100%',
        resize: false,
        onContentReady: function(e) {
            initDragging(e.element);
        },
        onInitialized: function(e) {
            $scope.columnChooserGrid = e.element;
        },
        allowColumnResizing: true,
        scrolling: {
            mode: "virtual"
        },
        filterRow: { visible: true },
        sorting: { mode: 'none' },
        hoverStateEnabled: true,
        controlColumnResizing: false,
        showRowLines: true,
        showColumnLines: true,
        selection: {
            mode: "single"
        },
        onRowValidating: function(e) {
            e.valid = true;
        },
        onRowPrepared: function(e) {
            if (e.rowType != 'data') return;
            e.rowElement.addClass('dragRow')
            e.rowElement.data('keyValue', e.key);
        },
        editing: {
            mode: "popup",
            allowUpdating: true,
            popup: {
                showTitle: false,
                width: 700,
                height: 345,
                position: {
                    my: "middle",
                    at: "middle",
                    of: window
                }
            }
        },
        columns: [{
            dataField: 'caption',
            caption: "Caption"
        }, {
            dataField: "hasAggregation",
            caption: "Aggregation",
            dataType: "boolean",
            allowFiltering: false
        }, {
            dataField: "visible",
            caption: "Visible",
            dataType: "boolean",
            allowFiltering: true
        }, {
            dataField: "format",
            caption: "Format",
            lookup: {
                allowClearing: false,
                dataSource: customColumnConfiguration.customColumnFormats,
                displayExpr: "text",
                valueExpr: "text"
            },
            allowFiltering: false
        }, {
            dataField: 'position',
            caption: "Position",
            visible: false,
            allowFiltering: false
        }]
    };

    $scope.columnChooserValidateButtonOptions = {
        text: 'Validate changes',
        onClick: function() {

            $scope.columnChooserGrid.dxDataGrid('instance')
                .saveEditData()
                .then((result) => {
                    $scope.updateGrid(() => {
                        _.forEach($scope.columnChooserDataSource._array, function(item) {

                            var column = _.find($scope.config.columns, function(col) {
                                return item.dataField === col.dataField;
                            });

                            column.visibleIndex = item.position;
                            column.caption = item.caption;
                            column.visible = item.visible;
                            
                            if (item.hasAggregation) {
                                createAggregation(item.dataField);
                            } else {
                                removeAggregation(item.dataField);
                            }

                            var format = _.find(customColumnConfiguration.customColumnFormats, function(formatting) {
                                return formatting.text == item.format
                            });

                            applyColumnFormating(column, format);

                        });

                        $timeout(() => {

                            $scope.gridInstance.option('columns', $scope.config.columns);
                            $scope.gridInstance.option('summary.groupItems', $scope.config.groupItems);

                        }, 500);
                    });
                    $scope.gridManagement.showColumnChooserConsole = false;
                });

        }
    };

    function getColumnFormat(column) {

        return _.find(customColumnConfiguration.customColumnFormats, function(item) {

            if (item.value.dataType == column.dataType) {

                if (dxGridExtensions.isUndefinedOrNull(item.value.format)) return false;

                if (item.value.format.type == column.format.type &&
                    item.value.format.precision == column.format.precision) return true;
            }

            return false;

        });
    };

    function getAllColumns() {

        var columnCount = $scope.gridInstance.columnCount();
        var columns = [];

        for (var i = 0; i < columnCount; i++) columns.push($scope.gridInstance.columnOption(i));

        return columns;
    };

    function initDragging($gridElement) {

        $gridElement.find('.dragRow').draggable({
            helper: 'clone',
            scroll: true,
            axis: "y",
            drag: function(event, ui) {

                $timeout(() => {

                    var scrollDownOffset = $scope.columnChooserGrid.height() + $scope.columnChooserGrid.offset().top - 50;
                    var scrollUpOffset = $scope.columnChooserGrid.offset().top + 50;

                    if (ui.offset.top < scrollUpOffset) {
                        var scrollable = $scope.columnChooserGrid.dxDataGrid("instance").getScrollable();
                        var offset = scrollable.scrollOffset().top - 10 < 0 ? 0 : scrollable.scrollOffset().top - 10;
                        console.log(offset);
                        scrollable.scrollTo(offset)
                    }

                    if (ui.offset.top > scrollDownOffset) {
                        var scrollable = $scope.columnChooserGrid.dxDataGrid("instance").getScrollable();
                        var offset = scrollable.scrollOffset().top + 10;
                        console.log(offset);
                        scrollable.scrollTo(offset)
                    };

                });

            },
            start: function(event, ui) {

                var $originalRow = $(this);
                var $clonedRow = ui.helper;
                var $originalRowCells = $originalRow.children();
                var $clonedRowCells = $clonedRow.children();

                for (var i = 0; i < $originalRowCells.length; i++) {
                    $($clonedRowCells.get(i)).width($($originalRowCells.get(i)).width());
                }

                $clonedRow.width($originalRow.width())
                $clonedRow.addClass('drag-helper');
            }
        });

        $gridElement.find('.dragRow').droppable({
            drop: function(event, ui) {

                var draggingRowKey = ui.draggable.data('keyValue');
                var targetRowKey = $(this).data('keyValue');

                if (dxGridExtensions.isUndefinedOrNull(targetRowKey)) return;

                var draggingIndex = null;
                var targetIndex = null;
                $scope.columnChooserDataSource.byKey(draggingRowKey).done(function(item) {
                    draggingIndex = item.position;
                });
                $scope.columnChooserDataSource.byKey(targetRowKey).done(function(item) {
                    targetIndex = item.position;
                });
                var draggingDirection = (targetIndex < draggingIndex) ? 1 : -1;
                var dataItems = null
                $scope.columnChooserDataSource.load().done(function(data) {
                    dataItems = data;
                });
                for (var dataIndex = 0; dataIndex < dataItems.length; dataIndex++) {
                    if ((dataItems[dataIndex].position > Math.min(targetIndex, draggingIndex)) && (dataItems[dataIndex].position < Math.max(targetIndex, draggingIndex))) {
                        dataItems[dataIndex].position += draggingDirection;
                    }
                }

                $scope.columnChooserDataSource.update(draggingRowKey, { position: targetIndex });
                $scope.columnChooserDataSource.update(targetRowKey, { position: targetIndex + draggingDirection });

                $gridElement.dxDataGrid('instance').refresh();
            }
        });
    };

    function applyColumnFormating(column, format) {

        column.dataType = format.value.dataType;
        column.format = { type: null, precision: null };

        if (!dxGridExtensions.isUndefinedOrNull(format.value.format)) {
            column.format.type = format.value.format.type;
            column.format.precision = format.value.format.precision;
        }

        var groupItem = _.find($scope.config.groupItems, function(item) {
            return item.column === column.dataField;
        });

        if (!dxGridExtensions.isUndefinedOrNull(groupItem)) {

            if (dxGridExtensions.isUndefinedOrNull(format.value.format)) {
                groupItem.valueFormat.type = null;
                groupItem.valueFormat.precision = null;
            } else {
                groupItem.valueFormat.type = format.value.format.type;
                groupItem.valueFormat.precision = format.value.format.precision;
            }

        }
    };

    function removeAggregation(dataField) {

        _.remove($scope.config.groupItems, function(item) {
            return item.column === dataField;
        });
    };

    function createAggregation(dataField) {

        if (null == $scope.currentColumn || $scope.currentColumn.dataType == "string") return;

        var result = _.find($scope.config.groupItems, function(item) {
            return item.column === dataField;
        });

        if (!dxGridExtensions.isUndefinedOrNull(result)) return;

        var group = createDefaultNumberGroupItem(dataField);
        $scope.config.groupItems.push(group);
    };

    function createColumnChooserColumnData(column, id) {

        var format = getColumnFormat(column);

        return {
            Id: id,
            dataField: column.dataField,
            caption: column.caption + '',
            visible: column.visible,
            hasAggregation: !dxGridExtensions.isUndefinedOrNull(_.find($scope.config.groupItems, function(group) {
                return group.column == column.dataField;
            })),
            position: column.visibleIndex,
            format: format.text
        };
    };
});
