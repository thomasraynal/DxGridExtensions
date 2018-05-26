dxGridExtension.service('customColumnConfiguration', function($log) {

    this.createCustomColumn = function(name, expression, formatting, visibleIndex) {

        return {
            name: name,
            expression: expression,
            formatting: formatting,
            dataField: name,
            caption: name,
            isCustomColumn: true,
            dataType: formatting.dataType,
            format: { type: formatting.format.type, precision: formatting.format.precision },
            visibleIndex: visibleIndex,
            calculateCellValue: (data) => {
                return this.computeCustomColumn(expression, data);
            },
        };
    };


    this.computeCustomColumn = function(expression, data) {

        try {

            var replacement = {};
            var processedExpression = expression;

            dxGridExtensions.initFormulas(this);

            _.forEach(data, function(value, key) {

                var replacement = (typeof value) === "string" ? "'" + value + "'" : value;
                processedExpression = processedExpression.split('[' + key + ']').join(" " + replacement + " ");

            });

            return eval(processedExpression);

        } catch (e) {
            $log.error(e);
        }
    };

    this.customColumnFormats = [{
        text: "string",
        value: {
            dataType: "string",
            format: { type: '', precision: 0 },
        }
    }, {
        text: "integer",
        value: {
            dataType: "number",
            format: { type: 'fixedpoint', precision: 0 },
        }
    }, {
        text: "percentage 2",
        value: {
            dataType: "number",
            format: { type: 'percent', precision: 2 },
        }
    }, {
        text: "percentage 5",
        value: {
            dataType: "number",
            format: { type: 'percent', precision: 5 },
        }
    }, {
        text: "decimal 2",
        value: {
            dataType: "number",
            format: { type: 'fixedpoint', precision: 2 },
        }
    }, {
        text: "decimal 5",
        value: {
            dataType: "number",
            format: { type: 'fixedpoint', precision: 5 },
        }
    }, {
        text: "boolean",
        value: {
            dataType: "boolean",
            format: { type: '', precision: 0 }
        }
    }];

});
