/**
 * Created by baultik on 12/19/16.
 */
describe("extra operations",function () {
    var calculator;

    beforeEach(function () {
        calculator = new Calculator();
    });

    it("handle order of operations",function () {
        calculator.addInput("1");
        calculator.addInput("+");
        calculator.addInput("3");
        calculator.addInput("÷");
        calculator.addInput("4");
        calculator.addInput("+");
        calculator.addInput("1");
        calculator.addInput("0");
        calculator.addInput("×");
        calculator.addInput("2");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(21.75);
    });

    it("handle power",function () {
        calculator.addInput("2");
        calculator.addInput("xy");
        calculator.addInput("3");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(8);
    });

    it("handle inverse",function () {
        calculator.addInput("2");
        calculator.addInput("1/x");

        expect(calculator.total()).toEqual(0.5);
    });

    it("handle factorial",function () {
        calculator.addInput("5");
        calculator.addInput("!");

        expect(calculator.total()).toEqual(120);
    });

    it("handle square root",function () {
        calculator.addInput("2");
        calculator.addInput("√");

        expect(calculator.total()).toEqual(1.414213562373095);
    });

    it("handle log",function () {
        calculator.addInput("2");
        calculator.addInput("log");

        expect(calculator.total()).toEqual(0.3010299956639811);
    });

    it("handle ln",function () {
        calculator.addInput("2");
        calculator.addInput("ln");

        expect(calculator.total()).toEqual(0.6931471805599453);
    });

    it("handle sin",function () {
        calculator.addInput("2");
        calculator.addInput("sin");

        expect(calculator.total()).toEqual(0.9092974268256817);
    });

    it("handle cos",function () {
        calculator.addInput("2");
        calculator.addInput("cos");

        expect(calculator.total()).toEqual(-0.4161468365471424);
    });

    it("handle tan",function () {
        calculator.addInput("2");
        calculator.addInput("tan");

        expect(calculator.total()).toEqual(-2.185039863261519);
    });

    it("handle sin degrees",function () {
        calculator.switchRadDeg();
        calculator.addInput("2");
        calculator.addInput("sin");

        expect(calculator.total()).toEqual(0.034899496702501);
    });

    it("handle cos degrees",function () {
        calculator.switchRadDeg();
        calculator.addInput("2");
        calculator.addInput("cos");

        expect(calculator.total()).toEqual(0.9993908270191);
    });

    it("handle tan degrees",function () {
        calculator.switchRadDeg();
        calculator.addInput("2");
        calculator.addInput("tan");

        expect(calculator.total()).toEqual(0.03492076949174773);
    });
});