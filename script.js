/**
 * Created by baultik on 11/22/16.
 */
var calc = null;
var typeEnum = {
    number: "number",
    operator: "operator",
    equalSign: "equalSign",
    clear: "clear",
    special: "special",
    sci: "sci"
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

    if (button.attr("id") === "radDeg") {
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
    var mTotal = 0;
    var mDisplay = new Display();
    var mIsRadians = true;
    var mRadDegButton = $("#radDeg");
    var kError = "Error";
    /**
     * Get the current total
     * @returns {number} The calculated total
     */
    this.total = function () {
        return mTotal
    };
    /**
     * Switch Radian and Degrees
     */
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
            if (lastEntry.type() === typeEnum.number) mDisplay.updateDisplay(lastEntry.value());
            setInitial(lastEntry);
            mDisplay.updateCalculation(mEntryQueue);
            return;
        }

        //new entry
        var entry = new Entry(input);
        mEntryQueue.push(entry);

        mDisplay.updateCalculation(mEntryQueue);

        if (entry.type() === typeEnum.operator || entry.type() === typeEnum.equalSign || entry.type() === typeEnum.sci) {
            var total = orderOfOps(mEntryQueue);
            if (total !== null) {
                mTotal = total;
                mDisplay.updateDisplay(mTotal);
            }
        } else if (entry.type() === typeEnum.number) {
            setInitial(entry);
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
     * Attempt to correct precision
     * @param number A numbered
     * @returns {Number} A number with corrected precision
     */
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
     * @returns {number|string} The number calculated or error string
     */
    function calculate(currentTotal, operatorIndex, queue) {
        var operatorEntry = queue[operatorIndex];
        var numberEntry = queue[operatorIndex + 1];

        if (operatorEntry && operatorEntry.type() !== typeEnum.sci && numberEntry) {
            var parsedValue = parseFloat(numberEntry.value());

            if (numberEntry.type() === typeEnum.equalSign) {
                parsedValue = currentTotal;
            }

            switch (operatorEntry.value()) {
                case "÷":
                    if (parsedValue == 0) {
                        return kError;//no calculation done
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
                    currentTotal = Math.pow(currentTotal, parsedValue);
                    break;
            }
            currentTotal = precision(currentTotal);
        } else if (operatorEntry) {//operator but no number - sci operation
            switch (operatorEntry.value()) {
                case "sin":
                    if (!mIsRadians) currentTotal *= Math.PI / 180;
                    currentTotal = Math.sin(currentTotal);
                    break;
                case "cos":
                    if (!mIsRadians) currentTotal *= Math.PI / 180;
                    currentTotal = Math.cos(currentTotal);
                    break;
                case "tan":
                    if (!mIsRadians) currentTotal *= Math.PI / 180;
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
                    if (currentTotal == 0) {
                        return kError;//no calculation done
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
        }

        return currentTotal;
    }

    /**
     * Prints a queue of {@link Entry} objects
     * @param queue The queue of {@link Entry} objects
     */
    function printQueue(queue) {
        var message = "Queue :";
        queue.forEach(function (entry) {
            message += entry.value() + " ";
        });

        console.log(message);
    }

    /**
     * Order of operators calculation. Finds the operators and performs the operations
     * @param queue The queue of {@link Entry} objects
     * @returns {number|null} The total calculated or null if no calculation happened
     */
    function orderOfOps(queue) {
        var operations = queue.slice();//local copy of queue
        var total = 0;
        var operatorEntry = null;
        var numberEntry = null;

        //Use copy of queue - handle operations by precedence and order - splice answers into array
        while (operations.length > 0) {
            var highest = findHighestOperator(operations);
            if (highest === null) {
                //No operator found
                //Finds the indexes of all equal sign entries in the queue
                var equalsIndices = [];
                operations.forEach(function (findEqualsEntry, findEqualsIndex) {
                    if (findEqualsEntry.type() === typeEnum.equalSign) {
                        equalsIndices.push(findEqualsIndex);
                    }
                });

                if (equalsIndices.length === 0) break;//Order of ops done

                //Handle extra = in multiple = entry
                for (var i = 0; i < operations.length; i++) {
                    var entry = operations[i];
                    if (entry && entry.type() === typeEnum.equalSign && numberEntry && numberEntry.type() !== typeEnum.equalSign) {
                        //replace = with last operation
                        operations.splice(i, 1, operatorEntry, numberEntry);
                        i = -1;
                    }
                }

                //new operator may be in queue -> find highest operator again
                highest = findHighestOperator(operations);
                if (highest === null) break;
            }

            //Need an operator and number to perform operation -> get all potential entries
            var left = operations[highest.index - 1];
            operatorEntry = operations[highest.index];
            numberEntry = operations[highest.index + 1];
            var equals = operations[highest.index + 2];

            //If an initial/left value exists -> use it and splice it out -> else use operator and number
            var current = 0;
            var startSplice = highest.index;
            var spliceCount = 1;
            if (left && left.type() === typeEnum.number) {
                current = left.value();
                startSplice = highest.index - 1;
                spliceCount++;
            }
            //If right operand exists and is right type -> add to splice
            if (numberEntry && (numberEntry.type() === typeEnum.number || numberEntry.type() === typeEnum.equalSign)) {
                spliceCount++;
            }
            //If element after right operand exists and is = -> add to splice
            if (equals && equals.type() === typeEnum.equalSign) {
                spliceCount++;
            }

            //printQueue(operations);
            total = calculate(parseFloat(current), highest.index, operations);
            if (total === kError) break;

            operations.splice(startSplice, spliceCount, new Entry(total));
            //printQueue(operations);
        }

        //console.log("calculation done: " + total);
        return total !== 0 ? total : null;
    }

    /**
     * Checks to see if the operator is scientific or not. If it is it must be one of the specified types
     * that require no right operand. If it is an operator it requires a right operand.
     * @param operatorEntry Operator in operation
     * @param numberEntry Right operand in operation
     * @returns {boolean} Whether an operation can be performed or not
     */
    function checkOperation(operatorEntry, numberEntry) {
        if (numberEntry) {
            return true;
        }
        else {
            switch (operatorEntry.value()) {
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
     * @returns {Array}
     */
    function findHighestOperator(queue) {
        //Locate all operators or sci - store operator indexes
        var operators = [];
        for (var i = 0; i < queue.length; i++) {
            var entry = queue[i];
            if (entry && (entry.type() === typeEnum.operator || entry.type() === typeEnum.sci)) {
                //If operators exist before a sci operator evaluate those first
                if (entry.type() === typeEnum.sci && operators.length > 0) {
                    return findHighestOperator(queue.slice(0, i));
                }
                operators.push(i);
            }
        }

        var highest = null;

        //Run through all operators - find highest by precedence
        for (var j = 0; j < operators.length; j++) {
            //Get operator and right operand
            var opIndex = operators[j];
            var operator = queue[opIndex];
            var numberEntry = queue[opIndex + 1];
            //Check operation
            if (!checkOperation(operator, numberEntry)) continue;

            var precedence = 1;

            //Only find operators - times and divide have higher precedence - use number that is > possible index
            if (operator.value() === "÷" || operator.value() === "×") {
                precedence = queue.length * 2;
            }

            var val = (queue.length - opIndex) * precedence;//Earlier indexes have higher precedence
            if (highest === null) highest = {index: 0, value: 0};
            if (val > highest.value) {
                highest.index = opIndex;
                highest.value = val;
            }
        }
        //console.log("returning...",highest);
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
     * @returns {string} The value
     */
    this.value = function () {
        return mValue;
    };
    /**
     * Type accessor function
     * @returns {string} The type
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