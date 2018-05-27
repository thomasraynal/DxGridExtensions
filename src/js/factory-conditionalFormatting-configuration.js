dxGridExtension.factory('conditionalFormattingConfiguration', function($log, customColumnConfiguration) {


    function applyConditionalFormattingExpressionOnCell(cell, rule, dataSource, customColumns) {

        try {
            if (cell.rowType == 'data' &&
                !dxGridExtensions.isUndefinedOrNull(rule) &&
                !dxGridExtensions.isUndefinedOrNull(cell.value) &&
                rule.target == cell.column.dataField &&
                cell.data != null
            ) {

                var self = this;

                if (rule.isExpressionBased) {

                    var expression = rule.expression;
                    var replacement = {};
                    var processedExpression = expression;

                    var row = cell.row.data;

                    _.forEach(row, function(value, key) {

                        dxGridExtensions.initFormulas(self);

                        var replacement = (typeof value) === "string" ? "'" + value + "'" : value;

                        var customColum = _.find(customColumns, (column) => {
                            return column.dataField == key;
                        });

                        if (customColum) {
                            replacement = customColumnConfiguration.computeCustomColumn(customColum.expression, row);
                        }

                        processedExpression = processedExpression.split('[' + key + ']').join(" " + replacement + " ");
                    });

                    var result = eval(processedExpression);

                    if (result) rule.formatting(cell, cell.value, rule);

                } else {

                    var value = cell.value;

                    var customColum = _.find(customColumns, (column) => {
                        return column.dataField == cell.column.dataField;
                    });

                    if (customColum) {
                        value = customColumnConfiguration.computeCustomColumn(customColum.expression, cell.row.data);
                    }

                    rule.formatting(cell, value, rule, dataSource);
                }

            };

        } catch (e) {
            $log.error(e);
        }
    };

    //refacto : otherway arround, list of rules to menu 
    var rules = [{
        "key": "Auto set",
        "items": [{
            text: "Proportional Bars",
            isExpressionBased: false,
            formatting: function(options, value, rule, dataSource) {

                if (options.column.dataType != 'number') return;

                if (value < 0) return;

                var total = _.sumBy(dataSource, function(o) {
                    return o[rule.target] != null && o[rule.target] > 0 ? o[rule.target] : 0;
                });

                var fieldHtml = "<div><div class='formatting bar superpose' style='background:" + rule.color + ";width:" + (value / total) * 100 + "%;''></div> <div class='formatting superpose'  style='z-index: 10;margin-top:-16px;'>" +
                    options.text +
                    "  </div></div>";

                options.cellElement.html(fieldHtml);

            }
        }, {
            text: "Up/Down colors",
            isExpressionBased: false,
            formatting: function(options, value, rule, dataSource) {

                if (options.column.dataType != 'number') return;

                if (value > 0) {
                    options.cellElement.css("color", "green");
                } else {

                    options.cellElement.css("color", "red");
                }

            }
        }, {
            text: "Up/Down icon",
            isExpressionBased: false,
            formatting: function(options, value, rule, dataSource) {

                if (options.column.dataType != 'number') return;

                if (value > 0) {
                    options.cellElement.append('<span class="cb cb-chevron-up" style="color:green;"></span>');
                } else {

                    options.cellElement.append('<span class="cb cb-chevron-down" style="color:red;"></span>');
                }

            }
        }]
    }, {
        "key": "Expression based",
        "items": [{
            text: "Text color",
            isExpressionBased: true,
            formatting: function(options, value, rule, dataSource) {
                $(options.cellElement[0]).css("color", rule.color);
            }
        }, {
            text: "Background Color",
            isExpressionBased: true,
            formatting: function(options, value, rule, dataSource) {
                $(options.cellElement[0]).css("background-color", rule.color);
            }
        }, {
            text: "Icon",
            isExpressionBased: true,
            formatting: function(options, value, rule, dataSource) {
                options.cellElement.append('<span class="' + rule.icon + '" style="color: ' + rule.color + ';"></span>');
            }
        }]
    }];

    var icons = [{
        name: "Arrow up",
        css: 'cb cb-arrow-up',
    }, {
        name: "Arrow down",
        css: 'cb cb-arrow-down',
    }, {
        name: "Chevron up",
        css: 'cb cb-chevron-up',
    }, {
        name: "Chevron down",
        css: 'cb cb-chevron-down',
    }, {
        name: "Spin up",
        css: 'cb cb-spin-up',
    }, {
        name: "Spin down",
        css: 'cb cb-spin-down',
    }, {
        name: "Favorites",
        css: 'cb cb-favorites',
    }, {
        name: "Like",
        css: 'cb cb-like',
    }, {
        name: "Info",
        css: 'cb cb-info',
    }, {
        name: "Todo",
        css: 'cb cb-todo',
    }];

    var getRuleTemplate = function(name) {

        var allRules = getAllRules();

        var template = _.find(allRules, function(rule) {
            return rule.text === name;
        });

        return _.clone(template);
    };

    var getRuleFromdescriptor = function(descriptor) {

        var rule = getRuleTemplate(descriptor.text);

        return _.extend(rule, descriptor)
    };

    var getAllRules = function() {
        return _.transform(rules, function(result, group) { _.each(group.items, function(rule) { result.push(rule) }, []) });
    };

    var createRule = function(name, target, expression, color, icon) {

        var rule = getRuleTemplate(name);

        if (dxGridExtensions.isUndefinedOrNull(rule)) throw new Error("Rule " + name + " does not exist");

        rule.target = target;
        rule.expression = expression;
        rule.color = color;
        rule.icon = icon;

        return rule;

    };

    return {
        getRuleFromdescriptor: getRuleFromdescriptor,
        createRule: createRule,
        applyConditionalFormattingExpressionOnCell: applyConditionalFormattingExpressionOnCell,
        getAllRules: getAllRules,
        availableRules: rules,
        availableIcons: icons
    };


});
