/**
 * Created by baultik on 11/22/16.
 */
var calc = null;
var typeEnum = {
    number: "number",
    operator: "operator",
    equalSign: "equalSign",
    clear: "clear"
};

$(document).ready(function () {
    calc = new Calculator();
    $(".btn").on("click", handleClick);
    $(document).on("keypress", handleKeyPress);
    $(document).on("keydown", handleSpecialKeys);
});
/**
 * Button click handler
 * @param event The click event
 */
function handleClick(event) {
    var button = $(this);
    button.blur(); //remove focus
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
        console.log("Found Match " + keyAsChar + " " + event.which);
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

        if (entry.type() === typeEnum.operator || entry.type() === typeEnum.equalSign) {
            //mTotal = calculate(mTotal,mOperationStart,mEntryQueue);
            mTotal = orderOfOps(mEntryQueue);
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
            }
            mDisplay.updateDisplay(currentTotal);
        }
        return currentTotal;
    }

    /**
     * Total the numbers of '=' in the queue. More than one
     * @param queue The current queue of {@link Entry} objects
     * @returns {number}
     */
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
                var equal = operations[operations.length - 1];
                if (equal && equal.type() === typeEnum.equalSign && equalsCount(operations) > 1) {
                    operations.splice(1,1,operatorEntry,numberEntry);
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

            //If an initial/left value exists - use it and splice it out - else use operator and number
            var current = 0;
            var startSplice = highest.index;
            var spliceCount = 2;
            if (left && left.type() === typeEnum.number) {
                current = left.value();
                startSplice = highest.index-1;
                spliceCount = 3;
            }

            total = calculate(parseFloat(current),highest.index,operations);
            if (operatorEntry && numberEntry) {
                //mDisplay.updateDisplay(total);
                operations.splice(startSplice, spliceCount, new Entry(total));
            }
        }
        //console.log("calculation done");
        //mDisplay.updateDisplay(total);
        return total;
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
            if (entry && entry.type() === typeEnum.operator) {
                var numberEntry = queue[i+1];
                if (!numberEntry) continue;

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
                if (mValue.endsWith(".") && value === ".") {
                    mValue = mValue.slice(0, mValue.length - 1);
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