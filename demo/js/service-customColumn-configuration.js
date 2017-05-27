dxGridExtensionDemo.service('customColumnConfiguration', function($log) {

    this.createCustomColumn = function(name, expression, format) {

        return {
            name: name,
            expression: expression,
            format: format
        };
    };

    this.computeCustomColumn = function(rule, datasource) {

        try {

            var expression = rule.expression;

            var replacement = {};
            var processedExpression = expression;

            _.forEach(datasource, function(item) {

                _.forEach(item, function(value, key) {

                    var replacement = (typeof value) === "string" ? "'" + value + "'" : value;
                    processedExpression = processedExpression.split('[' + key + ']').join(" " + replacement + " ");

                });

                var result = eval(processedExpression);
                item[rule.name] = result;
                processedExpression = expression;

            });

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
