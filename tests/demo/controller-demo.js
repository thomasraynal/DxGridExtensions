dxGridExtensionDemo
    .controller('demo', function demoCrtl($scope) {

        $scope.demoFlatData = window.dxGridExtensionsDemo.stockData;
        $scope.demoTreeData = window.dxGridExtensionsDemo.cashData;

        $scope.flatGrid = {};
        $scope.treeGrid = {};

        var root = _.find($scope.demoTreeData, (item) => {
            return item.uniqueParentId === null;
        });

        var height = window.outerHeight - 100;

        $scope.rootId = [root.uniqueId];

        $scope.demoFlatGridOptions = {

            bindingOptions: {
                dataSource: 'self.demoFlatData',
                'summary.groupItems': 'self.config.flatGrid.groupItems',
                'columns': 'self.config.flatGrid.columns'
            },
            height: height,
            resize: true,
            allowColumnReordering: true,
            allowColumnResizing: true,
            columnResizingMode: "widget",
            columnAutoWidth: true,
            grouping: {
                autoExpandAll: false,
            },
            columnChooser: {
                enabled: true
            },
            columnFixing: {
                enabled: true
            },
            scrolling: {
                mode: "virtual"
            },
            headerFilter: {
                visible: true
            },
            loadPanel: {
                enabled: false
            },
            hoverStateEnabled: true,
            controlColumnResizing: true,
            showRowLines: true,
            showColumnLines: true,
            selection: {
                mode: "single"
            },
            groupPanel: {
                visible: true
            },
            sorting: {
                mode: "multiple"
            }
        };

        $scope.demoTreeGridOptions = {
            bindingOptions: {
                dataSource: 'self.demoTreeData',
                columns: 'self.config.treeGrid.columns',
                expandedRowKeys: 'self.rootId'
            },
            height: height,
            keyExpr: "uniqueId",
            parentIdExpr: "uniqueParentId",
            showRowLines: false,
            allowColumnResizing: true,
            allowColumnReordering: true,
            columnAutoWidth: true,
            columnResizingMode: "widget",
            selection: {
                mode: "single"
            },
            columnFixing: {
                enabled: true
            },
            searchPanel: {
                visible: true
            },
            filterRow: {
                visible: false
            },
            headerFilter: {
                visible: false
            },
            columnChooser: {
                enabled: true
            }
        };



    });
