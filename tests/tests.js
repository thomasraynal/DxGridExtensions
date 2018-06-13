describe('dxGridExtensionTests', function() {

    //column chooser
    //remove and edit custom column
    //remove and edit conditional formatting

    var $timeout;

    function render() {
        $timeout.flush(1000);
    }

    function wait(finalizer, time) {

        if (!time) time = 1000;

        setTimeout(function() {
            if (finalizer) finalizer();
        }, time);
    }


    var $rootScope,
        $httpBackend,
        $timeout;

    beforeEach(module('dxGridExtension'), module('dxGridExtensionTemplates'));

    beforeEach(inject(function(_$rootScope_, _$timeout_, $compile) {

        $rootScope = _$rootScope_;

        $timeout = _$timeout_;

        $rootScope.demoFlatData = window.dxGridExtensionsDemo.stockData;
        $rootScope.demoTreeData = window.dxGridExtensionsDemo.cashData;

        $rootScope.flatGrid = {};
        $rootScope.treeGrid = {};

        $rootScope.demoFlatGridOptions = {
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

        $rootScope.demoTreeGridOptions = {
            height: 100,
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

        var flatGridelement = $compile('<flat-grid instance="flatGrid" options="demoFlatGridOptions" datasource="demoFlatData"/>')($rootScope);
        var treeGridElement = $compile('<tree-grid instance="treeGrid" options="demoTreeGridOptions" datasource="demoTreeData"/>')($rootScope);

        $rootScope.flatGridDirectiveScope = angular.element(flatGridelement[0]).scope();
        $rootScope.flatGridDirectiveScope.$digest();

        $rootScope.treeGridDirectiveScope = angular.element(treeGridElement[0]).scope();
        $rootScope.treeGridDirectiveScope.$digest();
    }));


    it('should test flat grid - column management', function() {


        var testScope = $rootScope.flatGridDirectiveScope;

        expect(testScope.management.datasource).toEqual($rootScope.demoFlatData);
        expect(testScope.management.groupItems.length).toEqual(4);
        expect(testScope.management.columns.length).toEqual(6);
        expect(testScope.management.options).toEqual($rootScope.demoFlatGridOptions);

        testScope.management.currentColumn = _.find(testScope.management.columns, (column) => column.dataField == "price");
        testScope.management.showColumnManagementConsole = true;

        var groupItem = _.find(testScope.management.groupItems, (group) => group.column == "price");

        expect(groupItem.valueFormat.precision).toEqual(2);
        expect(groupItem.valueFormat.type).toEqual("fixedpoint");


        testScope.$digest();

        testScope.columnManagementColumnFormating.value.dataType = "number";
        testScope.columnManagementColumnFormating.value.format.precision = 5;
        testScope.columnManagementColumnFormating.value.format.type = "percent";
        testScope.columnManagementColumnName = "newName";

        render();

        testScope.columnManagementValidate();

        expect(testScope.management.currentColumn.caption).toEqual(testScope.columnManagementColumnName);
        expect(testScope.management.currentColumn.format.type).toEqual(testScope.columnManagementColumnFormating.value.format.type);
        expect(testScope.management.currentColumn.format.precision).toEqual(testScope.columnManagementColumnFormating.value.format.precision);
        expect(groupItem.valueFormat.precision).toEqual(testScope.columnManagementColumnFormating.value.format.precision);
        expect(groupItem.valueFormat.type).toEqual(testScope.columnManagementColumnFormating.value.format.type);
    });

    it('should test flat grid - custom column', function(done) {

        var testScope = $rootScope.flatGridDirectiveScope;

        testScope.management.showCustomColumnConsole = true;

        render();

        expect(testScope.management.customColumns.length).toEqual(0);

        testScope.customColumnName = "NEW";
        testScope.customColumnExpressionText = "[price] * 2"
        testScope.customColumnFormating = {
            dataType: "number",
            format: { type: 'fixedpoint', precision: 2 }
        };

        testScope.management.currentColumn = _.find(testScope.management.columns, (column) => column.dataField == "price");

        testScope.customColumnCreateColumn();

        expect(testScope.management.customColumns.length).toEqual(1);
        expect(testScope.customColumnResult.length).toEqual(testScope.management.datasource.length);

        testScope.management.instance.refresh();

        testScope.$digest();

        var finalizer = function() {

            expect(testScope.management.columns.length).toEqual(7);
            expect(testScope.management.groupItems.length).toEqual(5);

            var customColumn = _.find(testScope.management.columns, (column) => column.dataField == testScope.customColumnName);

            expect(customColumn).not.toBeNull();

            done();
        };

        wait(finalizer);
    });

    it('should test flat grid - column chooser', function() {});

    it('should test flat grid - conditional formatting', function(done) {

        var testScope = $rootScope.flatGridDirectiveScope;

        testScope.management.showConditionalFormattingConsole = true;

        render();

        expect(testScope.management.conditionalFormattingRules.length).toEqual(0);

        testScope.selectedConditionalFormattingRule = {
            text: "Proportional Bars"
        };

        testScope.conditionalFormatingTargetColumn = "changeRel";
        testScope.currentConditionalFormattingColor = "#ffd900";

        testScope.conditionalFormattingCreateRule();

        expect(testScope.management.conditionalFormattingRules.length).toEqual(1);
        expect(testScope.conditionalFormattingResult.length).toEqual(testScope.management.datasource.length);

        testScope.management.instance.refresh();

        testScope.$digest();

        var finalizer = function() {

            var html = testScope.management.instance._$element.html();

            var appliedConditionalFormattingCssClasses = (html.match(/formatting bar superpose/g) || []).length;

            //40 is default visible rows on infinite scrolling grid
            expect(appliedConditionalFormattingCssClasses).toEqual(40);
            done();

        };

        wait(finalizer);
    });

    it('should test tree grid - custom column', function(done) {

        var testScope = $rootScope.treeGridDirectiveScope;
        var columnCount = testScope.management.columns.length;

        testScope.management.showCustomColumnConsole = true;

        render();

        expect(testScope.management.customColumns.length).toEqual(0);

        testScope.customColumnName = "NEW";
        testScope.customColumnExpressionText = "[balanceon2015-12-07] * 2"
        testScope.customColumnFormating = {
            dataType: "number",
            format: { type: 'fixedpoint', precision: 2 }
        };

        testScope.management.currentColumn = _.find(testScope.management.columns, (column) => column.dataField == "balanceon2015-12-07");

        testScope.customColumnCreateColumn();

        expect(testScope.management.customColumns.length).toEqual(1);
        expect(testScope.customColumnResult.length).toEqual(testScope.management.datasource.length);

        testScope.management.instance.refresh();

        testScope.$digest();

        var finalizer = function() {

            expect(testScope.management.columns.length).toEqual(columnCount + 1);

            var customColumn = _.find(testScope.management.columns, (column) => column.dataField == testScope.customColumnName);

            expect(customColumn).not.toBeNull();

            done();
        };

        wait(finalizer);
    });

    it('should test tree grid - column chooser', function() {});

    it('should test tree grid - conditional formatting', function(done) {

        var testScope = $rootScope.treeGridDirectiveScope;

        testScope.management.showConditionalFormattingConsole = true;

        render();

        expect(testScope.management.conditionalFormattingRules.length).toEqual(0);

        testScope.selectedConditionalFormattingRule = {
            text: "Proportional Bars"
        };

        testScope.conditionalFormatingTargetColumn = "balanceon2015-12-07";
        testScope.currentConditionalFormattingColor = "#ffd900";

        testScope.conditionalFormattingCreateRule();

        expect(testScope.management.conditionalFormattingRules.length).toEqual(1);
        expect(testScope.conditionalFormattingResult.length).toEqual(testScope.management.datasource.length);

        testScope.management.instance.refresh();

        testScope.$digest();

        var finalizer = function() {

            // var html = window.btoa(testScope.management.instance._$element.html())
            // expect(html).toEqual(expectedHtml);
            done();

        };

        wait(finalizer);
    });

});
