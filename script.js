/**
 * Created by baultik on 11/22/16.
 */

//var my_calculator = new calculator(callback);

var calc = new Calculator();
var display = null;
var typeEnum = {
    number: "number",
    operator: "operator",
    equalSign: "equalSign",
    clear: "clear"
};

$(document).ready(function () {
    $(".btn").on("click", handleClick);
    display = new Display();

});

//

function handleClick(event) {
    var val = $(this).text();
    calc.addInput(val);
}

function Calculator() {
    var entryQueue = [];
    var operationStart = 1;
    var total = 0;

    this.addInput = function (input) {
        var lastIndex = entryQueue.length - 1;
        var lastEntry = entryQueue[lastIndex];
        if (lastEntry && lastEntry.add(input)) {
            //entry exists and is number - add to it
            //update with current value - number ie 1.2
            display.updateDisplay(lastEntry.value());
            setInitial(lastEntry);
            return;
        }

        var entry = new Entry(input);
        entryQueue.push(entry);

        if (entry.type() === typeEnum.operator || entry.type() === typeEnum.equalSign) {

            total = calculate(total,operationStart);

            if (entry.type() === typeEnum.operator) {
                //update operation index
                operationStart = lastIndex + 1;
            }

        } else if (entry.type() === typeEnum.number) {
            setInitial(entry);
            display.updateDisplay(input);
        } else if (entry.type() === typeEnum.clear) {
            total = 0;
            entryQueue = [];
            display.updateDisplay(total);
        }
    };

    function setInitial(entry) {
        if (entry.type() === typeEnum.number && entryQueue.length == 1) {
            //first item
            total = parseFloat(entry.value());
        }
    }

    function calculate(currentTotal,operatorIndex) {
        var operatorEntry = entryQueue[operatorIndex];
        var numberEntry = entryQueue[operatorIndex+1];

        if (operatorEntry && numberEntry) {
            var parsedValue = parseFloat(numberEntry.value());

            if (numberEntry.type() === typeEnum.equalSign) {
                if (operatorIndex + 1 == entryQueue.length - 1) {
                    parsedValue = currentTotal;
                } else {
                    return currentTotal;
                }
            }

            switch (operatorEntry.value()) {
                case "÷":
                    if (parsedValue == 0){
                        display.updateDisplay("Error");
                        return currentTotal;
                    }
                    currentTotal /= parsedValue;
                    break;
                case "×":
                    currentTotal *= parsedValue;
                    break;
                case "+":
                    currentTotal += parsedValue;
                    break;
                case "-":
                    currentTotal -= parsedValue;
                    break;
            }
            display.updateDisplay(currentTotal);
        }
        return currentTotal;
    }
}

function Entry(value) {
    var mValue = value;
    var mType = null;

    this.value = function () {
        return mValue;
    };

    this.type = function () {
        if (mType === null) {
            mType = getType(mValue);
        }

        return mType;
    };

    this.add = function (value) {
        if (getType(value) !== this.type()) return false;

        switch (this.type()) {
            case typeEnum.number:
                if (mValue.endsWith(".") && value === ".") {
                    mValue = mValue.slice(0, mValue.length - 1);
                }
                mValue += value;
                display.updateDisplay(mValue);
                return true;
            case typeEnum.operator:
                mValue = value;
                return true;
        }
        return false;
    };

    var getType = function (value) {
        var type = "";

        switch (value) {
            case "CE":
            case "C":
                type = typeEnum.clear;
                break;
            case "÷":
            case "×":
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
        return type;
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
