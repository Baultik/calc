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
});