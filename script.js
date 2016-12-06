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
            if (lastEntry.type() === typeEnum.number ) display.updateDisplay(lastEntry.value());
            setInitial(lastEntry);
            display.updateCalculation(entryQueue);
            return;
        }

        var entry = new Entry(input);
        entryQueue.push(entry);

        display.updateCalculation(entryQueue);

        if (entry.type() === typeEnum.operator || entry.type() === typeEnum.equalSign) {

            //total = calculate(total,operationStart,entryQueue);
            total = orderOfOpsAttempt(entryQueue);

            if (entry.type() === typeEnum.operator) {
                //update operation index
                operationStart = lastIndex + 1;
            } else {

                display.clearCalculation();
            }
        } else if (entry.type() === typeEnum.number) {
            setInitial(entry);
            display.updateDisplay(input);
        } else if (entry.type() === typeEnum.clear) {
            total = 0;
            entryQueue = [];
            display.updateDisplay(total);
            display.clearCalculation();
        }
    };

    function setInitial(entry) {
        if (entry.type() === typeEnum.number && entryQueue.length == 1) {
            //first item
            total = parseFloat(entry.value());
        }
    }

    function calculate(currentTotal,operatorIndex,queue) {
        var operatorEntry = queue[operatorIndex];
        var numberEntry = queue[operatorIndex+1];

        if (operatorEntry && numberEntry) {
            var parsedValue = parseFloat(numberEntry.value());

            if (numberEntry.type() === typeEnum.equalSign) {
                //if (operatorIndex + 1 == queue.length - 1) {
                    parsedValue = currentTotal;
                // } else {
                //     return currentTotal;
                // }
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

    function equalsCount(queue){
        var equals = 0;
        for (var i = 0; i < queue.length; i++) {
            var entry = queue[i];
            if (entry.type() === typeEnum.equalSign) {
                equals++;
            }
        }
        return equals;
    }

    function orderOfOpsAttempt(entryQueue) {
        var operations = entryQueue.slice();
        var total = 0;
        var operatorEntry = null;
        var numberEntry = null;

        while (operations.length > 0) {
            var highest = findHighest(operations);
            if (highest === null) {
                var equal = operations[operations.length - 1];
                if (equal && equal.type() === typeEnum.equalSign && equalsCount(operations) > 1) {
                    operations.splice(1,1,operatorEntry,numberEntry);
                    highest = findHighest(operations);
                    if (highest === null) break;
                } else {
                    break;
                }
            }

            var left = operations[highest.index-1];
            operatorEntry = operations[highest.index];
            numberEntry = operations[highest.index+1];
            if (!operatorEntry || !numberEntry) break;

            var current = 0;
            var startSplice = highest.index;
            var spliceCount = 2;
            if (left && left.type() === typeEnum.number) {
                current = left.value();
                startSplice = highest.index-1;
                spliceCount = 3;
            }

            total = calculate(parseFloat(current),highest.index,operations);

            operations.splice(startSplice,spliceCount,new Entry(total));
        }

        return total;
    }

    this.tryIt = function() {
        var queue = [new Entry(1),new Entry("+"),new Entry(3),new Entry("÷"),new Entry(4),new Entry("+"),new Entry(10),new Entry("×"),new Entry(2)];
        return orderOfOpsAttempt(queue);
    };

    function findHighest(entryQueue) {
        var highest = null;
        //get order of operations
        for (var i = 0; i < entryQueue.length; i++) {
            var entry = entryQueue[i];
            var precedence = 1;
            if (entry && entry.type() === typeEnum.operator) {
                if (entry.value() ===  "÷" || entry.value() ===  "×") {
                    precedence = entryQueue.length * 10;
                }
                var val = (entryQueue.length - i ) * precedence;
                if (highest === null)highest = {index:0,value:0};
                if (val > highest.value) {
                    highest.index = i;
                    highest.value = val;
                    //console.log("Entry:" + entry.type() + " " + entry.value());
                }
            }
        }
        //console.log("returning...");
        return highest;
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
    var calculation = $("#calculation");

    this.updateDisplay = function (toDisplay) {
        display.html(toDisplay);
    };

    this.updateCalculation = function (arrayToDisplay) {
        var toDisplay = "";
        for (var i in arrayToDisplay) {
            toDisplay += arrayToDisplay[i].value();
        }
        calculation.html(toDisplay);
    };

    this.clearCalculation = function () {
        calculation.html(" ");
    };
}