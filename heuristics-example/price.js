/*
 * Listings priced at or below the GOAL_PRICE receive a 100% score, with a 1%
 * deduction for every DEDUCTION_STEP higher than that.
 */

var GOAL_PRICE = 800;
var DEDUCTION_STEP = 10;

exports.price = function (ad, callback) {
    /* If the price isn't given, who cares about it. */
    if (ad['g-core:price'] === undefined) {
        callback(null, 0);
    } else {
        var price = parseFloat(ad['g-core:price']);
        var score = Math.max(0, 100 - Math.max(price - GOAL_PRICE, 0) / DEDUCTION_STEP);
        callback(null, score);
    }
};
