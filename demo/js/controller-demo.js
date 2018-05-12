dxGridExtensionDemo
    .controller('demo', function demoCrtl($scope, $timeout) {

        $scope.demoFlatData = window.dxGridExtensionsDemo.stockData;
        $scope.demoTreeData = window.dxGridExtensionsDemo.cashData;

        $scope.flatGrid = {};
        $scope.treeGrid = {};


        var height = window.outerHeight - 100;

        $scope.expandedRowKeys = _.transform($scope.demoTreeData, (aggregate, item) => {
            aggregate.push(item.uniqueId);
        }, []);

        $scope.demoFlatGridOptions = {
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
                expandedRowKeys: 'self.expandedRowKeys'
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
