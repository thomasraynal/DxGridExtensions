dxGridExtensionDemo
    .controller('demo', function demoCrtl($scope, $timeout, $interval) {

        $timeout(() => {

            saveFlatGridLayout('default');
            saveTreeGridLayout('default');

            $scope.selectedFlatGridLayout = $scope.savedFlatGridLayouts[0];
            $scope.selectedTreeGridLayout = $scope.savedTreeGridLayouts[0];

        }, 1000);

        $scope.demoFlatData = window.dxGridExtensionsDemo.stockData;
        $scope.demoTreeData = window.dxGridExtensionsDemo.cashData;

        var layoutCount = 0;

        $scope.loadFlatGridLayoutGridButtonLabel;
        $scope.selectedFlatGridLayout;
        $scope.savedFlatGridLayouts = [];


        $scope.loadTreeGridLayoutGridButtonLabel;
        $scope.selectedTreeGridLayout;
        $scope.savedTreeGridLayouts = [];

        $scope.flatGrid = {};
        $scope.treeGrid = {};


        var height = window.outerHeight - 100;

        $scope.expandedRowKeys = _.transform($scope.demoTreeData, (aggregate, item) => {
            aggregate.push(item.uniqueId);
        }, []);


        $scope.$watch('selectedFlatGridLayout', function() {
            if (null == $scope.selectedFlatGridLayout) return;
            $scope.loadFlatGridLayoutGridButtonLabel = "Load Layout [" + $scope.selectedFlatGridLayout.name + "]";
        });

        $scope.$watch('selectedTreeGridLayout', function() {
            if (null == $scope.selectedTreeGridLayout) return;
            $scope.loadTreeGridLayoutGridButtonLabel = "Load Layout [" + $scope.selectedTreeGridLayout.name + "]";
        });


        $scope.saveFlatGridButtonOptions = {
            icon: 'save',
            text: 'Save Layout',
            onClick: function() {
                var layout = saveFlatGridLayout();
                DevExpress.ui.dialog.alert('Save current layout as ' + layout.name, 'Save Success');
            }
        };

        $scope.saveTreeGridButtonOptions = {
            icon: 'save',
            text: 'Save Layout',
            onClick: function() {
                var layout = saveTreeGridLayout();
                DevExpress.ui.dialog.alert('Save current layout as ' + layout.name, 'Save Success');
            }
        };

        $scope.loadLayoutTreeGridButtonOptions = {
            bindingOptions: {
                text: "loadTreeGridLayoutGridButtonLabel"
            },
            icon: 'arrowup',
            onClick: function() {
                restoreTreeGridLayout($scope.selectedTreeGridLayout);
            }
        };

        $scope.loadLayoutFlatGridButtonOptions = {
            bindingOptions: {
                text: "loadFlatGridLayoutGridButtonLabel"
            },
            icon: 'arrowup',
            onClick: function() {
                restoreFlatGridLayout($scope.selectedFlatGridLayout);
            }
        };

        $scope.savedFlatGridLayoutSelectBoxOptions = {
            bindingOptions: {
                items: "savedFlatGridLayouts",
                value: "selectedFlatGridLayout"
            },
            displayExpr: "name",

            onItemClick: function(e) {
                $scope.selectedFlatGridLayout = e.itemData;
            }
        };

        $scope.savedTreeGridLayoutSelectBoxOptions = {
            bindingOptions: {
                items: "savedTreeGridLayouts",
                value: "selectedTreeGridLayout"
            },
            displayExpr: "name",

            onItemClick: function(e) {
                $scope.selectedTreeGridLayout = e.itemData;
            }
        };

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

        function saveFlatGridLayout(name) {
            var layout = $scope.gridManagement.flatGrid.save();
            layout.name = name ? name : "layout_" + layoutCount++;
            var serializedlayout = JSON.parse(JSON.stringify(layout));
            $scope.savedFlatGridLayouts.push(serializedlayout);
            return layout;
        };

        function restoreFlatGridLayout(layout) {
            $scope.gridManagement.flatGrid.restore(layout);
        };

        function saveTreeGridLayout(name) {
            var layout = $scope.gridManagement.treeGrid.save();
            layout.name = name ? name : "layout_" + layoutCount++;
            var serializedlayout = JSON.parse(JSON.stringify(layout));
            $scope.savedTreeGridLayouts.push(serializedlayout);
            return layout;
        };

        function restoreTreeGridLayout(layout) {
            $scope.gridManagement.treeGrid.restore(layout);
        };



    });
