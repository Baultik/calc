/**
 * Created by baultik on 12/16/16.
 */
//require("../script.js");
//importScripts("../script.js");

describe("basic calculation",function () {
    it("can add",function () {
        var calculator = new Calculator();
        calculator.addInput("1");
        calculator.addInput("+");
        calculator.addInput("2");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(3);
    });

    it("can subtract",function () {
        var calculator = new Calculator();
        calculator.addInput("1");
        calculator.addInput("-");
        calculator.addInput("2");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(-1);
    });

    it("can multiply",function () {
        var calculator = new Calculator();
        calculator.addInput("1");
        calculator.addInput("×");
        calculator.addInput("2");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(2);
    });

    it("can divide",function () {
        var calculator = new Calculator();
        calculator.addInput("1");
        calculator.addInput("÷");
        calculator.addInput("2");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(0.5);
    })
});
