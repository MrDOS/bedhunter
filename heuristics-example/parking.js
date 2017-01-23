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
            callback(null, score);
            break;
        }
    }
};
