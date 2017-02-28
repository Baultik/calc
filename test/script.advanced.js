/**
 * Created by baultik on 12/19/16.
 */
describe("advanced operations",function () {
   var calculator;

   beforeEach(function () {
       calculator = new Calculator();
   });

   it("handles premature operation",function () {
       calculator.addInput("+");
       calculator.addInput("+");
       calculator.addInput("+");
       calculator.addInput("+");
       calculator.addInput("1");
       calculator.addInput("×");
       calculator.addInput("3");
       calculator.addInput("=");

       expect(calculator.total()).toEqual(3);
   });

    it("handles partial operand",function () {
        calculator.addInput("3");
        calculator.addInput("×");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(9);
    });

    it("handles missing operation",function () {
        calculator.addInput("3");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(3);
    });

    it("handles missing operation",function () {
        calculator.addInput("=");
        calculator.addInput("=");
        calculator.addInput("=");
        calculator.addInput("=");

        expect(calculator.total()).toEqual(0);
    });
});