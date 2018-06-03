(function() {
    window.dxGridExtensions = {
        isUndefinedOrNull: function(val) {
            return angular.isUndefined(val) || val === null;
        }
    };

    window.dxGridExtensions.groupCellTemplate = function(groupCell, info) {
        $('<div>').html(info.text).appendTo(groupCell);
    };

    window.dxGridExtensions.isInt = function(n) {
        return !isNaN(Number(n)) && Number(n) % 1 === 0;
    };

    window.dxGridExtensions.isFloat = function(n) {
        return !isNaN(Number(n)) && Number(n) % 1 !== 0;
    };

    window.dxGridExtensions.resetSelectBoxValue = function(selectBoxId) {

        var instance = $(selectBoxId).dxSelectBox("instance");
        if (dxGridExtensions.isUndefinedOrNull(instance)) return;
        instance.option("value", null);
    };

    window.dxGridExtensions.initFormulas = function(scope) {

        scope.AND = formulajs.AND;
        scope.OR = formulajs.OR;
        scope.NOT = formulajs.NOT;
        scope.IF = formulajs.IF;
        scope.ISNULL = formulajs.ISNULL;
        scope.CEILING = formulajs.CEILING;
        scope.EXP = formulajs.EXP;
        scope.FLOOR = formulajs.FLOOR;
        scope.MAX = formulajs.MAX;
        scope.MIN = formulajs.MIN;
        scope.POW = formulajs.POW;
        scope.RAND = formulajs.RAND;
        scope.RANDBETWEEN = formulajs.RANDBETWEEN;
        scope.ROUND = formulajs.ROUND;
        scope.SIGN = formulajs.SIGN;
        scope.DECIMAL = formulajs.DECIMAL;
        scope.INT = formulajs.INT;
        scope.CONCATENATE = formulajs.CONCATENATE;
        scope.CONTAINS = formulajs.CONTAINS;
        scope.LEN = formulajs.LEN;
        scope.LOWER = formulajs.LOWER;
        scope.MID = formulajs.MID;
        scope.TRIM = formulajs.TRIM;
        scope.UPPER = formulajs.UPPER;
        scope.TODAY = formulajs.TODAY;
        scope.WEEKDAY = formulajs.WEEKDAY;
        scope.MONTH = formulajs.MONTH;
        scope.YEAR = formulajs.YEAR;
    };

})();

angular.module('dxGridExtensionTemplates', []);
var dxGridExtension = angular.module('dxGridExtension', ['dx', 'dxGridExtensionTemplates']);
