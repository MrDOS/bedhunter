/*
 * Try to determine whether the listing is in a tower/highrise/large multiunit
 * building and mark down appropriately.
 *
 * This doesn't work very well, as it turns out. The smart way to do this would
 * have been to have abused Canada Post's postal code lookup tool
 * (https://www.canadapost.ca/cpo/mc/personal/postalcode/fpc.jsf) to determine
 * the number of units at a given address (because the AddressComplete service,
 * https://www.canadapost.ca/pca/, is ridiculously expensive). Their web service
 * delivers JSON results and doesn't seem to mind cross-site requests. Not sure
 * if it's rate-limited; if it is, a good workaround would be to cache results
 * (as many ads get reposted but the number of unique listings is in the low
 * dozens per day).
 */
exports.notTower = function (ad, callback) {
    if (ad.title.match(/tower|condo/i)
        || ad.innerAd.desc.match(/tower|condo/)) {
        return callback(null, 0);
    } else if (ad.innerAd.info.Address !== undefined
        && ad.innerAd.info.Address.match(/^The /i)) {
        return callback(null, 50);
    } else {
        return callback(null, 100);
    }
};
