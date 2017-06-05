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

    //https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
    Object.byString = function(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, ''); // strip a leading dot
        var a = s.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in o) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    }
})();

angular.module('dxGridExtensionTemplates', []);
var dxGridExtension = angular.module('dxGridExtension', ['dx', 'ngRoute', 'dxGridExtensionTemplates']);
