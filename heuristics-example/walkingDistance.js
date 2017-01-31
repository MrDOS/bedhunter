/*
 * Determines how close a listing is to something by walking distance. Scoring
 * works on the same model as the price score: listings within GOAL_RADIUS
 * metres of the ORIGIN receive a 100% score, with a 1% deduction for every
 * DEDUCTION_STEP metres outside of it.
 *
 * To use, you'll need a Google Maps Distance Matrix API key which you can sign
 * up for in the Google API Console (https://console.developers.google.com/).
 */

var GOOGLE_MAPS_KEY = '';
var ORIGIN = [45, -75];
/* Being within this many metres of the origin is a perfect score. */
var GOAL_RADIUS = 500;
var DEDUCTION_STEP = 10;

var googleMapsClient = require('@google/maps').createClient({
    key: GOOGLE_MAPS_KEY
});

exports.walkingDistance = function (ad, callback) {
    if (ad['geo:lat'] !== undefined && ad['geo:long'] !== undefined) {
        /* If the ad has coordinates, just use those. */
        var destinations = [[ad['geo:lat'], ad['geo:long']]];
    } else if (ad.innerAd.info.Address !== undefined) {
        /* If it has no coordinates but it does have an address (yes, this
         * happens – not sure how), use that instead. */
        var destinations = [ad.innerAd.info.Address];
    } else {
        /* We can't calculate a score without location data and never will be
         * able to, so we need to return a real score to prevent retrying the
         * calculation every time scoring runs. */
        callback(null, 0);
        return;
    }

    googleMapsClient.distanceMatrix({
        origins: [ORIGIN],
        destinations: destinations,
        mode: 'walking',
        units: 'metric'
    }, function (err, res) {
        if (err != null) {
            callback(err, null);
        }

        var result = res.json.rows[0].elements[0];
        if (result.status === 'OK') {
            var distance = result.distance.value;
            var score = Math.max(0, 100 - Math.max(distance - GOAL_RADIUS, 0) / DEDUCTION_STEP);
            callback(null, score);
        } else if (result.status === 'ZERO_RESULTS') {
            /* ZERO_RESULTS is a failure of the data, not the API, so as above,
             * we need to return a real score. */
            callback(null, 0);
        } else {
            console.log('%s:', ad.link, result.status);
            callback(result.status, null);
        }
    });
};
