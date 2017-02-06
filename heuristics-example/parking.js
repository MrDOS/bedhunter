/*
 * Tries to determine what sort of parking is available. This is fairly
 * inaccurate as there are many ways the lister can indicate whether parking is
 * available or not and none of them are structured. Worse, there are several
 * variations on the sorts of parking available: included with the rent, not
 * included but available on-site (and then indoor vs. outdoor), only street
 * parking available, or not available at all.
 */

var CRITERIA = [
    [/no parking|parking unavailable/i, 0],
    /* Street parking blows. */
    [/street parking/i, 35],
    [/parking included/i, 100],
    [/parking available|dedicated parking/i, 75],
    /* The add says _something_ about parking at least... */
    [/parking/i, 50],
    /* Unclear whether parking is mentioned at all in the ad so we'll score it
     * low but higher than a total unavailability. */
    [/./i, 25]
];

exports.parking = function (ad, callback) {
    var description = ad.innerAd.desc;
    for (var i = 0; i < CRITERIA.length; i++) {
        var pattern = CRITERIA[i][0];
        var score = CRITERIA[i][1];
        if (description.match(pattern)) {
            return callback(null, score);
        }
    }
};
