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
