/*
 * Listing URLs indicate the category they've been put into. This isn't always
 * accurate (especially toward the small end – I've seen small one-bedrooms
 * listed as bachelors and large bachelors listed as a one-bedrooms) but it's
 * better than nothing.
 */

var RANKS = {
    'bachelor': 0,
    '1-bedroom-apartments': 25,
    '1-bedroom-den-apartments': 50,
    '2-bedroom-apartments': 75,
    '.': 100
};

exports.size = function (ad, callback) {
    for (rank in RANKS) {
        if (ad.link.match(rank)) {
            callback(null, RANKS[rank]);
            break;
        }
    }
};
