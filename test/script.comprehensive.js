/**
 * Created by baultik on 12/19/16.
 */
describe("comprehensive operations",function () {
    var calculator;

    beforeEach(function () {
        calculator = new Calculator();
    });

    it("successive",function () {
        calculator.addInput("1");
        calculator.addInput("+");
        calculator.addInput("1");
        calculator.addInput("+");
        calculator.addInput("2");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(4);
    });

    it("decimals",function () {
        calculator.addInput("1");
        calculator.addInput(".");
        calculator.addInput("1");
        calculator.addInput("+");
        calculator.addInput("1");
        calculator.addInput(".");
        calculator.addInput("1");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(2.2);
    });

    it("multiple decimals",function () {
        calculator.addInput("1");
        calculator.addInput(".");
        calculator.addInput(".");
        calculator.addInput(".");
        calculator.addInput("1");
        calculator.addInput("+");
        calculator.addInput("1");
        calculator.addInput(".");
        calculator.addInput(".");
        calculator.addInput(".");
        calculator.addInput("1");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(2.2);
    });

    it("multiple operation input",function () {
        calculator.addInput("1");
        calculator.addInput("+");
        calculator.addInput("+");
        calculator.addInput("+");
        calculator.addInput("+");
        calculator.addInput("2");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(3);
    });

    it("changing operation input",function () {
        calculator.addInput("1");
        calculator.addInput("+");
        calculator.addInput("-");
        calculator.addInput("×");
        calculator.addInput("2");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(2);
    });

    it("operation repeat",function () {
        calculator.addInput("1");
        calculator.addInput("+");
        calculator.addInput("1");
        calculator.addInput("=");
        calculator.addInput("=");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(4);
    });

    it("operation rollover",function () {
        calculator.addInput("1");
        calculator.addInput("+");
        calculator.addInput("1");
        calculator.addInput("+");
        calculator.addInput("=");
        calculator.addInput("+");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(8);
    });

    it("operation rollover",function () {
        calculator.addInput("1");
        calculator.addInput("÷");
        calculator.addInput("0");
        calculator.addInput("=");

        expect(calculator.total()).toEqual("Error");
    });
});