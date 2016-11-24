/**
 * Created by baultik on 11/22/16.
 */

//var my_calculator = new calculator(callback);
var operation = [];

var typeEnum = {
    number:"number",
    operator:"operator",
    equalSign:"equalSign",
    clear:"clear"
};

$(document).ready(function () {
    $(".btn").on("click",handleClick);
});

function handleClick(event) {
    var val = $(this).text();

    //Create input object to hold input
    var input = new Input(val);
    var lastAction = null;
    var total = 0;

    //TODO:handle clear

    //TODO:deal with initial number input
    if (operation.length > 0) {
        lastAction = operation[operation.length - 1];
        if (lastAction.hasOperator() &&
            lastAction.hasNumber() &&
            (input.type() === typeEnum.operator || input.type() === typeEnum.equalSign)) {
            //existing action with existing operator and number - input is operator or equal sign
            //action is complete - make new action and pass in total from old operator - add input - push to array
            total = lastAction.total();

            var newAction = new Action(total);
            newAction.addInput(input);
            operation.push(newAction);

            //TODO: update display with new total
        } else {
            //existing action is incomplete
            //check type - if number or operator - add to last action
            //replacing operator || adding to number || equal sign
            switch (input.type()) {
                case typeEnum.number:
                case typeEnum.operator:
                    lastAction.addInput(input);
                    break;
            }

        }

    }



    //test input context against last/current action

    //validate it
    //evaluate it
    //respond/display

}

function Action(value) {
    var inputs = [];
    var startValue = value;
    var number = "";
    var operator = null;

    this.addInput = function (input) {
        var lastIndex = inputs.length - 1;
        if (inputs.length > 0) {
            var lastInput = inputs[lastIndex];
            if (lastInput.type() === typeEnum.operator && input.type() === typeEnum.operator) {
                //new input and last input is type operator - replace with new operator
                inputs[lastIndex] = input;
                return;
            }
        }
        //TODO: FIX input accepted
        //Only accept number and operator type input
        switch (input.type()) {
            case typeEnum.number:
                if (number.length === 0 && input.value() === ".") number += "0";
                if (lastInput.type() === typeEnum.number) {
                    number += "" + input.value();
                } else {
                    number = "" + input.value();
                }
                inputs.push(input);
                break;
            case typeEnum.operator:
                operator = input;
                inputs.push(input);
                break;
            default:
                throw "Unrecognized input sent to action instance. Actions take only inputs of type number and operator";
                break;
        }
    };

    this.total = function () {
        switch (operator.value()) {
            case "&divide":
                return startValue / parseFloat(number);
            case "&times":
                return startValue * parseFloat(number);
            case "+":
                return startValue + parseFloat(number);
            case "-":
                return startValue - parseFloat(number);
        }

        return null;
    };

    this.startValue = function () {
        return startValue;
    };

    this.number = function () {
        return parseFloat(number);
    };

    this.hasOperator = function () {
        return (operator !== null);
    };

    this.hasNumber = function () {
        return (number.length > 0);
    };
}


function Input(value) {
    var val = value;
    var type = null;

    this.value = function () {
        return val;
    };

    this.type = function () {
        if (type === null) {
            type = getType(val);
        }

        return type;
    };

    var getType = function (value) {
        var type = "";

        switch (val) {
            case "CE":
            case "C":
                type = typeEnum.clear;
                break;
            case "&divide":
            case "&times":
            case "+":
            case "-":
                type = typeEnum.operator;
                break;
            case "=":
                type = typeEnum.equalSign;
                break;
            default:
                type = typeEnum.number;
                break;
        }
    }
}

function Display() {
    var display = $("#display");

    this.updateDisplay = function (toDisplay) {
        display.html(toDisplay);
    };

    this.clearDisplay = function () {
        display.html(" ");
    };
}
