describe('dxGridExtensionTests', function() {

    beforeEach(module('dxGridExtension'), module('dxGridExtensionTemplates'));

    beforeEach(inject(function($compile, _$rootScope_) {

        $rootScope = _$rootScope_;

        $rootScope.demoFlatData = window.dxGridExtensionsDemo.stockData;

        $rootScope.flatGrid = {};

        $rootScope.demoFlatGridOptions = {

            bindingOptions: {
                dataSource: 'self.demoFlatData',
                'summary.groupItems': 'self.config.flatGrid.groupItems',
                'columns': 'self.config.flatGrid.columns'
            },
            height: 100,
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

        var element = $compile('<flat-grid instance="flatGrid" options="demoFlatGridOptions" /><flat-grid-management instance="flatGrid" datasource="demoFlatData" /> ')($rootScope);
        $rootScope.$digest();
        console.log(element.controller("flatGridManagement"));

    }));

    it('should test flat grid', function() {


        //angular.element(element[0]).scope()


        //$rootScope.config;
        //should have 6 columns 
        //        symbol
        // company
        // price
        // change
        // changeRel
        // volume

        //should have 4 groups 
        // price
        // change
        // changeRel
        // volume


        //add a conditional formating

        //add a custom column


    });

});
