/**
 * Created by baultik on 11/22/16.
 */

var my_calculator = new calculator(callback);

$(document).ready(function () {
    $(".btn").on("click", function (event) {
        var val = $(this).text();
        switch (val) {
            case "CE":
                my_calculator.allClear();
                break;
            default:
                my_calculator.addItem(val);
                break;
        }
    });
});

function callback(type, value, item) {
    switch (type) {
        case "itemAdded":
        case "calculated":
            $("#display").html(value);
            break;
        case "error":
        default:
            $("#display").html(" ");
            break;
    }
}
