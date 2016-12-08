/**
 * Created by baultik on 11/22/16.
 */
var calc = null;
var typeEnum = {
    number: "number",
    operator: "operator",
    equalSign: "equalSign",
    clear: "clear",
    special:"special",
    sci:"sci"
};

$(document).ready(function () {
    calc = new Calculator();
    var doc = $(document);
    $(".btn").on("click", handleClick);
    doc.on("keypress", handleKeyPress);
    doc.on("keydown", handleSpecialKeys);

    var calcBody = $(".calculator-body");
    var mainGrid = $("#grid-main");
    var sciGrid = $("#grid-sci");

    //var window = $(window);
    if (doc.width() > doc.height()) {
        //scientific
        calcBody.addClass("calculator-body-sci");
        mainGrid.addClass("grid-right");
    } else {
        sciGrid.hide();
    }
});
/**
 * Button click handler
 * @param event The click event
 */
function handleClick(event) {
    var button = $(this);
    button.blur(); //remove focus

    if (button[0] === calc.getRadDegButton()[0]) {
        calc.switchRadDeg();
        return;
    }

    var val = button.text();
    calc.addInput(val);
}
/**
 * Special key handler. For the delete key to clear the caclulator
 * @param event The keydown event
 */
function handleSpecialKeys(event) {
    if (event.which == 46) {
        //delete key - doesn't trigger keypress but does keydown
        //console.log("Delete " + event.charCode + " " + event.which);
        calc.addInput("C");//C to clear
    }
}
/**
 * Main key handler. Matches the numbers, operators, and enter/=.
 * Key press gives the true character code from event.which that I match to the button text elements
 * @param event The keypress handler
 */
function handleKeyPress(event) {
    var keyAsChar = String.fromCharCode(event.which);
    var pattern = /[0-9./*\-+\r=]/;

    if (keyAsChar.match(pattern) !== null) {
        //console.log("Found Match " + keyAsChar + " " + event.which);
        if (keyAsChar === "*") {
            keyAsChar = "×";
        } else if (keyAsChar === "/") {
            keyAsChar = "÷";
        } else if (event.which === 13) {
            keyAsChar = "=";
        }
        calc.addInput(keyAsChar);
    } else {
        //console.log("No Match " + event.which + " " + keyAsChar);
    }
}
/**
 * Calculator which handles the calculations and receives the input.
 * @constructor
 */
function Calculator() {
    var mEntryQueue = [];
    var mOperationStart = 1;
    var mTotal = 0;
    var mDisplay = new Display();
    var mIsRadians = true;
    var mRadDegButton = $("#radDeg");
    this.getRadDegButton = function () {
        return mRadDegButton;
    };
    this.switchRadDeg = function () {
        mIsRadians = !mIsRadians;
        if (mIsRadians) {
            mRadDegButton.text("Rad");
        } else {
            mRadDegButton.text("Deg");
        }
    };
    /**
     * Accepts and handles user input
     * @param input The user input {@link Entry} object
     */
    this.addInput = function (input) {
        //Check if can append or replace input
        var lastIndex = mEntryQueue.length - 1;
        var lastEntry = mEntryQueue[lastIndex];
        if (lastEntry && lastEntry.add(input)) {
            //entry exists and is number -> add to it - or is operator -> replace it
            //update mDisplay with current value - ie 1.2
            if (lastEntry.type() === typeEnum.number ) mDisplay.updateDisplay(lastEntry.value());
            setInitial(lastEntry);
            mDisplay.updateCalculation(mEntryQueue);
            return;
        }

        //new entry
        var entry = new Entry(input);
        mEntryQueue.push(entry);

        mDisplay.updateCalculation(mEntryQueue);

        if (entry.type() === typeEnum.operator || entry.type() === typeEnum.equalSign || entry.type() === typeEnum.sci) {
            //mTotal = calculate(mTotal,mOperationStart,mEntryQueue);
            mTotal = orderOfOps(mEntryQueue);
            var a = 0;
/*
            if (entry.type() === typeEnum.operator) {
                mOperationStart = lastIndex + 1;
            } else {
                mDisplay.clearCalculation();
            }*/
        } else if (entry.type() === typeEnum.number) {
            setInitial(entry);
            //mTotal = orderOfOps(mEntryQueue);
            mDisplay.updateDisplay(input);
        } else if (entry.type() === typeEnum.clear) {
            mTotal = 0;
            mEntryQueue = [];
            mDisplay.updateDisplay(mTotal);
            mDisplay.clearCalculation();
        }
    };
    /**
     * If the first entry is a number, display that number
     * @param entry The {@link Entry} object
     */
    function setInitial(entry) {
        if (entry.type() === typeEnum.number && mEntryQueue.length == 1) {
            //first item
            mTotal = parseFloat(entry.value());
        }
    }

    function precision(number) {
        var result = number;
        var numStr = number.toString();
        var period = numStr.indexOf(".");
        var count = period;
        if (period >= 0) {
            for (var i = period + 1; i < numStr.length; i++) {
                var char = numStr[i];
                if (char !== "0") {
                    count++;
                }
            }
            result = parseFloat(numStr).toPrecision(count);
        }

        return parseFloat(result);
    }

    /**
     * Calculates an operation
     * @param currentTotal The total to add to or the left operand
     * @param operatorIndex The index of the operator in the queue
     * @param queue The queue with the operator and right operand
     * @returns {*} The number calculated
     */
    function calculate(currentTotal,operatorIndex,queue) {
        var operatorEntry = queue[operatorIndex];
        var numberEntry = queue[operatorIndex+1];

        if (operatorEntry && operatorEntry.type() !== typeEnum.sci &&
            numberEntry /*&& (numberEntry.type() === typeEnum.number || numberEntry.type() === typeEnum.equalSign)*/) {
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
                        mDisplay.updateDisplay("Error");
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
                case "xy":
                    currentTotal = Math.pow(currentTotal,parsedValue);
                    break;
            }
            currentTotal = precision(currentTotal);
            mDisplay.updateDisplay(currentTotal);
        } else if (operatorEntry) {
            switch (operatorEntry.value()) {
                case "sin":
                    if (!mIsRadians) currentTotal *= Math.PI/180;
                    currentTotal = Math.sin(currentTotal);
                    break;
                case "cos":
                    if (!mIsRadians) currentTotal *= Math.PI/180;
                    currentTotal = Math.cos(currentTotal);
                    break;
                case "tan":
                    if (!mIsRadians) currentTotal *= Math.PI/180;
                    currentTotal = Math.tan(currentTotal);
                    break;
                case "√":
                    currentTotal = Math.sqrt(currentTotal);
                    break;
                case "ln":
                    currentTotal = Math.log(currentTotal);
                    break;
                case "log":
                    currentTotal = Math.log(currentTotal) / Math.LN10
                    break;
                case "1/x":
                    if (currentTotal == 0){
                        mDisplay.updateDisplay("Error");
                        return currentTotal;
                    }
                    currentTotal = 1 / currentTotal;
                    break;
                case "!":
                    var fact = 1;
                    for (var i = 2; i <= currentTotal; i++) {
                        fact *= i;
                    }
                    currentTotal = fact;
                    break;
            }
            currentTotal = precision(currentTotal);
            mDisplay.updateDisplay(currentTotal);
        }
        return currentTotal;
    }
    /**
     * Total the numbers of '=' in the queue. More than one
     * @param queue The current queue of {@link Entry} objects
     * @returns {Array} An array of the indices where '=' appears
     */
    function equalsCount(queue){
        var equals = [];
        for (var i = 0; i < queue.length; i++) {
            var entry = queue[i];
            if (entry.type() === typeEnum.equalSign) {
                equals.push(i);
            }
        }
        return equals;
    }

    function printQueue(queue) {
        var message = "Queue :";
        for (var i = 0; i < queue.length; i++) {
            message += queue[i].value() + " ";
        }
        console.log(message);
    }

    /**
     * Order of operators calculation. Finds the operators and performs the operations
     * @param queue The queue of {@link Entry} objects
     * @returns {number} The total calculated
     */
    function orderOfOps(queue) {
        var operations = queue.slice();
        var total = 0;
        var operatorEntry = null;
        var numberEntry = null;

        //Use copy of queue - handle operations by precedence and order - splice answers into array
        while (operations.length > 0) {
            var highest = findHighestOperator(operations);
            if (highest === null) {
                //Handle extra = in multiple = entry
                //var equal = operations[operations.length - 1];
                var equalsIndices = equalsCount(operations);
                if (equalsIndices.length > 0) {
                    for (var i = 0; i < operations.length; i++) {
                        var entry = operations[i];
                        if (entry && entry.type() === typeEnum.equalSign && numberEntry && numberEntry.type() !== typeEnum.equalSign) {
                            operations.splice(i,1,operatorEntry,numberEntry);
                            i = -1;
                        }
                    }

                    highest = findHighestOperator(operations);
                    if (highest === null) break;
                } else {
                    break;
                }
            }

            //Need an operator and number to perform operation
            var left = operations[highest.index-1];
            operatorEntry = operations[highest.index];
            numberEntry = operations[highest.index+1];
            var equals = operations[highest.index+2];

            //If an initial/left value exists - use it and splice it out - else use operator and number
            var current = 0;
            var startSplice = highest.index;
            var spliceCount = 1;
            if (left && left.type() === typeEnum.number) {
                current = left.value();
                startSplice = highest.index-1;
                spliceCount++;
            }

            if (numberEntry && (numberEntry.type() === typeEnum.number || numberEntry.type() === typeEnum.equalSign)) {
                spliceCount++;
            }

            if (equals && equals.type() === typeEnum.equalSign) {
                spliceCount++;
            }
            printQueue(operations);
            total = calculate(parseFloat(current),highest.index,operations);
            if (operatorEntry && checkOperator(operatorEntry,numberEntry)) {
                //mDisplay.updateDisplay(total);
                operations.splice(startSplice, spliceCount, new Entry(total));
                printQueue(operations);
            }
        }
        //console.log("calculation done");
        //mDisplay.updateDisplay(total);
        return total;
    }

    function checkOperator(entry,numberEntry) {
        if (numberEntry) {
            return true;
        }
        else {
            switch (entry.value()) {
                case "sin":
                case "cos":
                case "tan":
                case "√":
                case "ln":
                case "log":
                case "1/x":
                case "!":
                    return true;
            }
        }

        return false
    }

    /**
     * Finds the highest operator based on precedence and position
     * @param queue The current queue {@link Entry} objects
     * @returns {*}
     */
    function findHighestOperator(queue) {
        var highest = null;
        //get order of operations
        for (var i = 0; i < queue.length; i++) {
            var entry = queue[i];
            var precedence = 1;
            if (entry && (entry.type() === typeEnum.operator || entry.type() === typeEnum.sci)) {
                var numberEntry = queue[i+1];
                if (!checkOperator(entry,numberEntry)) continue;

                //Only find operators - times and divide have higher precedence - use number not a possible index
                if (entry.value() ===  "÷" || entry.value() ===  "×") {
                    precedence = queue.length * 10;
                }
                var val = (queue.length - i ) * precedence;
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
/**
 * Represents a user input as an object
 * @param value The input from the user
 * @constructor
 */
function Entry(value) {
    var mValue = value;
    var mType = null;

    /**
     * Value accessor function
     * @returns {*} The value
     */
    this.value = function () {
        return mValue;
    };
    /**
     * Type accessor function
     * @returns {*} The type
     */
    this.type = function () {
        if (mType === null) {
            mType = getType(mValue);
        }

        return mType;
    };
    /**
     * Attempt to add user inputs. Try to concatenate numbers and replace operators. Ignore other types
     * @param value The user input
     * @returns {boolean} Whether or not the input was handled
     */
    this.add = function (value) {
        if (getType(value) !== this.type()) return false;

        switch (this.type()) {
            case typeEnum.number:
                if (mValue.includes(".") && value === ".") {
                    //mValue = mValue.slice(0, mValue.length - 1);
                    return true;
                }
                mValue += value;
                return true;
            case typeEnum.operator:
                mValue = value;
                return true;
        }
        return false;
    };
    /**
     * Get a normalized type from the value
     * @param value The value
     * @returns {string} The normalized type
     */
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
            case "xy":
                type = typeEnum.operator;
                break;
            case "sin":
            case "cos":
            case "tan":
            case "√":
            case "ln":
            case "log":
            case "1/x":
            case "!":
                type = typeEnum.sci;
                break;
            case "Rad":
            case "Deg":
                type = typeEnum.special;
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
/**
 * Display a value in the DOM
 * @constructor
 */
function Display() {
    var display = $("#display");
    var calculation = $("#calculation");
    /**
     * Update the main display with a value
     * @param toDisplay The value to display
     */
    this.updateDisplay = function (toDisplay) {
        display.html(toDisplay);
    };
    /**
     * Update the calculation read out from the queue
     * @param queueToDisplay The queue of {@link Entry} objects
     */
    this.updateCalculation = function (queueToDisplay) {
        var toDisplay = "";
        for (var i in queueToDisplay) {
            toDisplay += queueToDisplay[i].value();
        }
        calculation.html(toDisplay);
    };
    /**
     * Clear the calculation read out
     */
    this.clearCalculation = function () {
        calculation.html(" ");
    };
}