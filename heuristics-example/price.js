var GOAL_PRICE = 800;
var DEDUCTION_PRICE = 10;

exports.price = function (ad, callback) {
    /* If the price isn't given, who cares about it. */
    if (ad['g-core:price'] === undefined) {
        callback(null, 0);
    } else {
        var price = parseFloat(ad['g-core:price']);
        var score = Math.max(0, 100 - Math.max(price - GOAL_PRICE, 0) / DEDUCTION_PRICE);
        callback(null, score);
    }
};
