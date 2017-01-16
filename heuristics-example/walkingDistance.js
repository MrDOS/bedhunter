var GOOGLE_MAPS_KEY = '';
var ORIGIN = [45, -75];
/* Being within this many metres of the origin is a perfect score. */
var ACCEPTABLE_RADIUS = 500;
var DEDUCTION_DISTANCE = 10;

var googleMapsClient = require('@google/maps').createClient({
    key: GOOGLE_MAPS_KEY
});

exports.walkingDistance = function (ad, callback) {
    googleMapsClient.distanceMatrix({
        origins: [ORIGIN],
        destinations: [[ad['geo:lat'], ad['geo:long']]],
        mode: 'walking',
        units: 'metric'
    }, function (err, res) {
        if (err != null) {
            callback(err, null);
        }

        var distance = res.json.rows[0].elements[0].distance.value;
        var score = Math.max(0, 100 - Math.max(distance - ACCEPTABLE_RADIUS, 0) / DEDUCTION_DISTANCE);
        callback(null, score);
    });
};
